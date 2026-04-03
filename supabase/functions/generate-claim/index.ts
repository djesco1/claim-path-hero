import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractJsonFromResponse(response: string): unknown {
  let cleaned = response
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const jsonStart = cleaned.search(/\{/);
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No JSON object found in response");
  }

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(cleaned);
  } catch (_e) {
    // Fix common LLM JSON issues
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, " ") // control chars including bad escapes
      .replace(/\\(?!["\\/bfnrtu])/g, "\\\\"); // fix bad escape sequences

    try {
      return JSON.parse(cleaned);
    } catch (_e2) {
      // Last resort: extract fields manually
      const titleMatch = cleaned.match(/"title"\s*:\s*"([^"]+)"/);
      const docMatch = cleaned.match(/"document_text"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"legal_rights)/);
      const instrMatch = cleaned.match(/"instructions"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"deadline)/);
      const probMatch = cleaned.match(/"success_probability"\s*:\s*(\d+)/);

      if (titleMatch && docMatch) {
        return {
          title: titleMatch[1],
          document_text: docMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
          legal_rights: [],
          instructions: instrMatch ? instrMatch[1].replace(/\\n/g, "\n") : "Consulte con un abogado para los próximos pasos.",
          deadline_suggestion: null,
          success_probability: probMatch ? parseInt(probMatch[1]) : 50,
        };
      }

      throw new Error("Could not parse AI response after multiple attempts");
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { claim_type, situation_description, counterparty_name, counterparty_type, amount_involved, incident_date, country } = await req.json();

    // Check plan limits
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
    if (profile?.plan === "free" && profile.claims_used >= 2) {
      return new Response(JSON.stringify({ error: "PLAN_LIMIT_REACHED" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const claimTypeLabels: Record<string, string> = {
      landlord_deposit: "Arrendamiento - Depósito",
      wrongful_termination: "Laboral - Despido injusto",
      insurance_denial: "Seguros - Reclamación negada",
      public_entity: "Entidad pública - Derecho de petición",
      service_refund: "Empresa/Servicio - Reembolso",
      other: "Otro",
    };

    const systemPrompt = `Eres un experto en derecho colombiano especializado en generar documentos legales formales de reclamación. Tu tarea es generar un documento legal completo, profesional y listo para enviar.

REGLAS:
- El documento debe estar en español colombiano formal
- Cita artículos específicos de la legislación colombiana
- Incluye saludo, hechos, fundamentos jurídicos, pretensiones y cierre
- El documento debe tener al menos 400 palabras
- Incluye fecha y espacios para firma
- Sé específico y contundente en los argumentos legales

REGLAS DE FORMATO JSON:
- Responde ÚNICAMENTE con JSON válido, sin texto adicional
- NO uses caracteres de escape inválidos en strings
- Usa \\n para saltos de línea dentro de strings
- NO uses comillas dobles sin escapar dentro de strings
- Asegúrate de que el JSON sea parseable

Responde con esta estructura exacta:
{
  "title": "Título corto descriptivo de la reclamación",
  "document_text": "Texto completo del documento legal formal",
  "legal_rights": [
    {
      "name": "Nombre del derecho",
      "legal_basis": "Ley/Artículo específico",
      "explanation": "Explicación de cómo aplica",
      "strength": "strong"
    }
  ],
  "instructions": "Instrucciones paso a paso para enviar la reclamación",
  "deadline_suggestion": "YYYY-MM-DD",
  "success_probability": 75
}

Para success_probability, evalúa del 0 al 100 qué tan probable es que esta reclamación tenga éxito considerando:
- Solidez de los fundamentos legales
- Claridad de los hechos descritos
- Monto involucrado vs proporcionalidad
- Tipo de contraparte
- Precedentes jurisprudenciales típicos en Colombia
Sé realista y honesto en la evaluación.`;

    const userPrompt = `Genera un documento legal de reclamación con estos datos:

Tipo: ${claimTypeLabels[claim_type] || claim_type}
País: ${country || "Colombia"}
Situación: ${situation_description}
Contraparte: ${counterparty_name} (${counterparty_type === "company" ? "Empresa" : counterparty_type === "person" ? "Persona" : "Entidad pública"})
${amount_involved ? `Monto involucrado: $${amount_involved} COP` : ""}
${incident_date ? `Fecha del incidente: ${incident_date}` : ""}

Genera el documento completo con referencias legales reales colombianas. Responde SOLO con JSON válido.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    const parsed = extractJsonFromResponse(content) as {
      title: string;
      document_text: string;
      legal_rights: unknown[];
      instructions: string;
      deadline_suggestion: string | null;
      success_probability: number;
    };

    // Calculate deadline (30 days from now if not provided)
    const deadline = parsed.deadline_suggestion || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Insert claim
    const { data: claim, error: insertError } = await supabase.from("claims").insert({
      user_id: user.id,
      title: parsed.title,
      claim_type,
      status: "draft",
      situation_description,
      counterparty_name,
      counterparty_type,
      amount_involved: amount_involved || null,
      incident_date: incident_date || null,
      generated_document: parsed.document_text,
      instructions: parsed.instructions,
      legal_rights: parsed.legal_rights,
      deadline_date: deadline,
      success_probability: Math.min(100, Math.max(0, parsed.success_probability || 50)),
    }).select("id").single();

    if (insertError) throw insertError;

    // Increment claims_used
    await supabase.from("users").update({ claims_used: (profile?.claims_used || 0) + 1 }).eq("id", user.id);

    // Add timeline event
    await supabase.from("claim_timeline").insert([
      { claim_id: claim.id, event_type: "created" },
      { claim_id: claim.id, event_type: "document_generated" },
    ]);

    // Trigger embed-claim asynchronously
    const embedUrl = `${supabaseUrl}/functions/v1/embed-claim`;
    fetch(embedUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ claim_id: claim.id, user_id: user.id, text: parsed.document_text }),
    }).catch(console.error);

    return new Response(JSON.stringify({ id: claim.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("generate-claim error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === "Unauthorized" ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
