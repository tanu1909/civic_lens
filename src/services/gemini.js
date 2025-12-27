import {GoogleGenerativeAI} from "@google/generative-ai";

const API_KEY=import.meta.env.VITE_GEMINI_API_KEY;
const genAI=new GoogleGenerativeAI(API_KEY);

export async function ImageAnalysis(imageFile){
   try{
    if(!API_KEY){
        console.log("your API key is missing");
        return null;
    }
// This uses the specific version number, which is much safer than "flash"
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const imagePart = await fileToGenerativePart(imageFile);
    console.log("image part- ",imagePart);

// Logic Step D: The "Smarter" Prompt
  const prompt = `
    You are an AI Civic Issue Detector for the government. 
    Analyze this image for strictly "Civic Infrastructure Hazards" (e.g., deep potholes, broken streetlights, piles of garbage, fire hazards, dangerous cracks).

    STRICT RULES:
    1. If the image looks like a normal, safe public area (like a park, a clean road, or a building) with only minor wear and tear, return "isSafetyHazard": false and severity: 0.
    2. Do NOT flag minor things like "faded paint", "patches of dirt", or "small cracks" as hazards.
    3. Only flag issues that require a repair crew to come out.
    4. Return valid JSON only.

    JSON Structure:
    {
      "issue": "Short Title",
      "description": "Brief explanation",
      "severity": Number (1-10, where 10 is immediate death risk, 0 is safe),
      "isSafetyHazard": Boolean
    }
  `;
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log(text);

    const cleanText=text.replace(/```json|```/g,"").trim();
    console.log(cleanText);
    return JSON.parse(cleanText);

   }
   catch(e){
    console.log("Error fetching the detail ",e);
    return null;
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
