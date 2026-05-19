import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) throw new Error("No image data provided");

    const cleanBase64 = imageBase64.split('base64,').pop(); 

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Stricter prompt enforcing your table's direct keys and constraints
    const prompt = `
      You are an expert infrastructure auditing agent working on the CivicLens ecosystem.
      
      CRITICAL EVALUATION RULES:
      1. Carefully inspect the image provided.
      2. If the image contains technical data plots, charts, line graphs (such as gait cycle analytics or acceleration lines), company logos (e.g., Boult, Boat), portraits, text documents, or indoor items, you MUST consider this a non-civic entity.
      3. For any non-civic entity, you MUST strictly set "severity" to 0.

      Provide your response ONLY as a clean minified JSON object structure. Do not apply markdown tags (such as \`\`\`json).

      JSON Schema Target:
      {
        "issue": "Specific short category title (or 'No direct civic infrastructure issue detectable')",
        "description": "Clear sentence describing the visible hazard or context.",
        "severity": 0
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ analysis: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (e) {
    console.error("EDGE_FUNCTION_ERROR:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})