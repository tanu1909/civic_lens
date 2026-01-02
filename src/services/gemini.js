import {GoogleGenerativeAI} from "@google/generative-ai";

const API_KEY=import.meta.env.VITE_GEMINI_API_KEY;//api key
const genAI=new GoogleGenerativeAI(API_KEY);

export async function ImageAnalysis(imageFile){//function to analyze image
   try{
    if(!API_KEY){
        console.log("your API key is missing");
        return null;
    }

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });//model of gemini
    const imagePart = await fileToGenerativePart(imageFile);//converting image to text data to send to ai model


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
    const result = await model.generateContent([prompt, imagePart]);//result in json
    const response = await result.response;
    const text = response.text();
    

    const cleanText=text.replace(/```json|```/g,"").trim();//cleaning the text
    
    return JSON.parse(cleanText);

   }
   catch(e){
    console.error("Error fetching the detail ",e);
    return null;
   }
}

async function fileToGenerativePart(file) {//function to convert the image file to its text data
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({
      inlineData: { data: reader.result.split(',')[1], mimeType: file.type },
    });
    reader.readAsDataURL(file);
  });
}
