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

    // Check rate limit: 5 extractions per day
    const { data: profile } = await supabase.from("users").select("ocr_extractions_today, ocr_last_reset").eq("id", user.id).single();

    const today = new Date().toISOString().split("T")[0];
    let extractionsToday = profile?.ocr_extractions_today || 0;

    if (profile?.ocr_last_reset !== today) {
      extractionsToday = 0;
      await supabase.from("users").update({ ocr_extractions_today: 0, ocr_last_reset: today }).eq("id", user.id);
    }

    if (extractionsToday >= 5) {
      return new Response(JSON.stringify({ error: "Daily OCR limit reached (5/day)" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image_base64, mime_type } = await req.json();
    if (!image_base64) throw new Error("image_base64 is required");

    const mType = mime_type || "image/jpeg";

    // Use Gemini vision for OCR
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this document image. Return ONLY the extracted text, preserving the original structure and formatting as much as possible. If there are tables, preserve them. If there are dates, numbers, or names, be especially precise.",
              },
              {
                type: "image_url",
                image_url: { url: `data:${mType};base64,${image_base64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI OCR error:", aiResponse.status, errText);
      throw new Error("OCR failed");
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || "";

    // Determine confidence based on text length
    const confidence = extractedText.length > 200 ? "high" : extractedText.length > 50 ? "medium" : "low";

    // Increment extraction count
    await supabase.from("users").update({ ocr_extractions_today: extractionsToday + 1 }).eq("id", user.id);

    return new Response(JSON.stringify({ extracted_text: extractedText, confidence }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("extract-text error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === "Unauthorized" ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
