import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function VerifyIssueResolved(imageFile) {
  try {
    if (!API_KEY) {
      console.error("Error: Your API key is missing.");
      return { isResolved: false, feedback: "API Key Missing" };
    }

    // FIX: Using valid model name 'gemini-1.5-flash'
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imagePart = await fileToGenerativePart(imageFile);

    const verificationPrompt = `
      You are an AI Civic Compliance Officer.
      Analyze the image to determine if a civic issue (like a pothole or trash) has been repaired.
      Return JSON only:
      {
        "isResolved": true | false,
        "isManipulated": true | false,
        "confidenceScore": 0.0-1.0,
        "feedback": "Reasoning"
      }
    `;

    const result = await model.generateContent([verificationPrompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse JSON
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);

  } catch (e) {
    console.error("AI Analysis Error:", e);
    return { isResolved: false, feedback: "AI service unavailable." };
  }
}

async function fileToGenerativePart(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({
      inlineData: { data: reader.result.split(',')[1], mimeType: file.type },
    });
    reader.readAsDataURL(file);
  });
}