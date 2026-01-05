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
  Analyze this image for civic issues (potholes, garbage, broken streetlights, waterlogging, etc.).
  
  CRITICAL INSTRUCTION: First, check the image quality.
  
  1. IF THE IMAGE IS BLURRY, TOO DARK, OR UNCLEAR:
     - Set 'issue' to "Image Unclear".
     - Set 'description' to "The image is too blurry or dark to analyze. Please retake a clear photo."
     - Set 'severity' to 0.
  
  2. IF THE IMAGE IS CLEAR BUT HAS NO ISSUES:
     - Set 'issue' to "No Hazard Detected".
     - Set 'description' to "The area appears safe with no visible civic infrastructure issues."
     - Set 'severity' to 0.

  3. IF A VALID ISSUE IS FOUND:
     - Identify the specific issue (e.g., "Deep Pothole", "Garbage Dump").
     - Describe it in 2 sentences.
     - Rate severity 1-10.

  Output MUST be valid JSON:
  { "issue": "String", "description": "String", "severity": Number }
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
