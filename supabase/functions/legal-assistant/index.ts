import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { message, conversation_id, claim_id } = await req.json();
    if (!message) throw new Error("Message is required");

    // Get or create conversation
    let convId = conversation_id;
    let existingMessages: any[] = [];

    if (convId) {
      const { data: conv } = await supabase
        .from("assistant_conversations")
        .select("messages")
        .eq("id", convId)
        .eq("user_id", user.id)
        .single();
      if (conv) existingMessages = conv.messages || [];
    }

    if (!convId) {
      const { data: newConv, error } = await supabase
        .from("assistant_conversations")
        .insert({ user_id: user.id, claim_id: claim_id || null, messages: [] })
        .select("id")
        .single();
      if (error) throw error;
      convId = newConv.id;
    }

    // Retrieve legal context from legal_knowledge (text search fallback since embeddings may not be set)
    const { data: legalDocs } = await supabase
      .from("legal_knowledge")
      .select("content, source, content_type")
      .limit(10);

    const legalContext = legalDocs?.map(d => `[${d.source}] (${d.content_type}): ${d.content}`).join("\n\n") || "No hay contexto legal disponible.";

    // Retrieve claim context if claim_id provided
    let claimContext = "";
    if (claim_id) {
      const { data: claim } = await supabase
        .from("claims")
        .select("title, claim_type, situation_description, counterparty_name, generated_document")
        .eq("id", claim_id)
        .eq("user_id", user.id)
        .single();

      if (claim) {
        claimContext = `
Título: ${claim.title}
Tipo: ${claim.claim_type}
Contraparte: ${claim.counterparty_name}
Situación: ${claim.situation_description?.substring(0, 500)}
${claim.generated_document ? `Documento generado (extracto): ${claim.generated_document.substring(0, 500)}...` : ""}`;
      }

      // Also get claim chunks
      const { data: chunks } = await supabase
        .from("claim_embeddings")
        .select("chunk_text")
        .eq("claim_id", claim_id)
        .limit(3);
      if (chunks?.length) {
        claimContext += "\n\nFragmentos del caso:\n" + chunks.map(c => c.chunk_text).join("\n");
      }
    }

    const systemPrompt = `Eres un asistente legal especializado en derecho colombiano, integrado en ClaimPath.
Tu función es ayudar a los usuarios a entender sus derechos y el proceso de reclamación.

REGLAS CRÍTICAS:
- NUNCA des asesoría legal formal. Eres una guía informativa.
- Siempre aclara que no reemplazas a un abogado para casos complejos.
- Responde SIEMPRE en español colombiano, tono cálido y directo.
- Si no sabes algo con certeza, dilo abiertamente.
- Cita las leyes específicas cuando las uses (Ley 820 de 2003, Art. 29, etc.)
- Sé conciso: máximo 3 párrafos por respuesta, salvo que el usuario pida detalle.

CONTEXTO LEGAL RECUPERADO:
${legalContext}

CONTEXTO DEL CASO DEL USUARIO:
${claimContext || "No hay caso específico seleccionado."}`;

    // Build conversation history (last 6 messages)
    const recentMessages = existingMessages.slice(-6);
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...recentMessages,
      { role: "user", content: message },
    ];

    // Call AI with streaming
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    // We need to collect the full response to save to DB while streaming to client
    const reader = aiResponse.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullAssistantMessage = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));

            // Parse SSE to collect full message
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) fullAssistantMessage += content;
                } catch {}
              }
            }
          }

          // Save conversation after streaming completes
          const updatedMessages = [
            ...existingMessages,
            { role: "user", content: message },
            { role: "assistant", content: fullAssistantMessage },
          ];

          await supabase
            .from("assistant_conversations")
            .update({ messages: updatedMessages })
            .eq("id", convId);

          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Conversation-Id": convId,
      },
    });
  } catch (error: any) {
    console.error("legal-assistant error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === "Unauthorized" ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
