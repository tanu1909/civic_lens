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

    // 1. Initialize API
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
    
    // 2. MODEL NAME FIX: Ensure this matches the exact API ID
    // In code, it is usually "gemini-2.5-flash" (lowercase with hyphens)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // 3. GENERATE CONTENT FIX: Simplified array format to avoid "not iterable" error
    const prompt = `Analyze this image for civic infrastructure issues. Return ONLY a JSON object:
    { "issue": "Title", "description": "One sentence", "severity": 1-10, "issue_detected": true }`;

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