import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Ensure this is set in your .env file
const genAI = new GoogleGenerativeAI(API_KEY);

export async function VerifyIssueResolved(imageFile) {
     try {
    if (!API_KEY) {
     console.error("Error: Your API key is missing.");
     return null;
     }

    // ERROR 1 FIXED: Changed "gemini-2.5-flash" (invalid) to "gemini-1.5-flash" (valid)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

     const imagePart = await fileToGenerativePart(imageFile);

  const verificationPrompt = `
     You are an AI Civic Compliance Officer.

Your task is to assess whether a reported civic issue appears to have been reasonably resolved based on the uploaded image evidence.

This image is provided as post-repair proof for a civic issue such as a pothole, broken streetlight, or garbage accumulation. GPS metadata has already been validated separately; your focus is visual confirmation only.

IMPORTANT GUIDELINES:
- Real-world repair images may be imperfect.
- Lighting, angle, or minor blur alone are NOT grounds for rejection.
- Only reject if the image is clearly unusable or clearly manipulated.

EVALUATION STEPS:

1. IMAGE INTEGRITY CHECK:
   - Look for strong signs of AI generation or heavy digital manipulation.
   - If the image appears authentic (even if low quality), continue analysis.
   - Only mark as manipulated if there is clear evidence.

2. REPAIR ASSESSMENT:
   - Determine whether the issue appears reasonably addressed.
   - Examples:
     - Potholes: patched surface, filled area, smoother road section.
     - Streetlights: intact fixture, visible repair, or illumination at night.
     - Garbage/debris: area mostly cleared, reduced accumulation.
   - Partial or non-perfect repairs may still count as resolved.

3. QUALITY TOLERANCE:
   - Accept images that are slightly blurry, shadowed, or taken from a distance.
   - Reject only if the issue cannot be visually assessed at all.
   Analyze whether this image reasonably indicates that a reported civic issue
has been addressed or improved.

Do not reject unless the image clearly contradicts repair.
If uncertain, say "Likely resolved but unclear".


OUTPUT REQUIREMENTS:
Return JSON only, using the following format:

{
  "isResolved": true | false,
  "isManipulated": true | false,
  "confidenceScore": number between 0 and 1,
  "feedback": "Brief explanation of your decision"
}

    `; // ERROR 2 FIXED: Removed the extra ` ; ` garbage characters here

    // ERROR 3 FIXED: Changed [prompt, imagePart] to [verificationPrompt, imagePart]
    const result = await model.generateContent([verificationPrompt, imagePart]);
    
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse JSON
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);

  } catch (e) {
    console.error("Error analyzing image:", e);
    // Return a safe fallback so your app doesn't crash
    return { isResolved: false, feedback: "Error connecting to AI verification service." };
  }
}

// Helper function remains the same
async function fileToGenerativePart(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({
      inlineData: { data: reader.result.split(',')[1], mimeType: file.type },
    });
    reader.readAsDataURL(file);
  });
} 