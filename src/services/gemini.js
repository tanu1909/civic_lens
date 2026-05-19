import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function ImageAnalysis(imageFile) {

   try {

      if (!API_KEY) {
         console.log("your API key is missing");
         return null;
      }

      const model = genAI.getGenerativeModel({
         model: "gemini-2.5-flash"
      });

      const imagePart = await fileToGenerativePart(imageFile);

      const prompt = `Analyze image`;

      const result = await model.generateContent([
         prompt,
         imagePart
      ]);

      const response = await result.response;
      const text = response.text();

      const cleanText = text.replace(/```json|```/g, "").trim();

      return JSON.parse(cleanText);

   }
   catch (e) {
      console.error("Error fetching detail", e);
      return null;
   }
}

async function fileToGenerativePart(file) {

   return new Promise((resolve) => {

      const reader = new FileReader();

      reader.onloadend = () => resolve({
         inlineData: {
            data: reader.result.split(',')[1],
            mimeType: file.type
         }
      });

      reader.readAsDataURL(file);
   });
}