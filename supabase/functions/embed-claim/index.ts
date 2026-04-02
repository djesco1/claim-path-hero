import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(" "));
    start = end - overlap;
    if (start >= words.length) break;
  }
  return chunks;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { claim_id, user_id, text } = await req.json();
    if (!claim_id || !user_id || !text) throw new Error("Missing required fields");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

    const chunks = chunkText(text);
    console.log(`Embedding ${chunks.length} chunks for claim ${claim_id}`);

    for (const chunk of chunks) {
      // Use Lovable AI to generate embeddings via tool calling workaround
      // Since the gateway is chat-based, we use a simple embedding proxy approach
      // Store chunks without embeddings; the legal-assistant will embed on query
      await supabase.from("claim_embeddings").insert({
        claim_id,
        user_id,
        chunk_text: chunk,
        embedding: null, // Will be embedded on first similarity search
      });
    }

    return new Response(JSON.stringify({ success: true, chunks: chunks.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("embed-claim error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
