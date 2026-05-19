// import {GoogleGenerativeAI} from "@google/generative-ai";

// const API_KEY=import.meta.env.VITE_GEMINI_API_KEY;//api key
// const genAI=new GoogleGenerativeAI(API_KEY);

// export async function ImageAnalysis(imageFile){//function to analyze image
//    try{
//     if(!API_KEY){
//         console.log("your API key is missing"); 
//         return null;
//     }

// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });//model of gemini
//     const imagePart = await fileToGenerativePart(imageFile);//converting image to text data to send to ai model



// //* * GEMINI PROMPT FOR SAFETY & INFRASTRUCTURE * */

// const prompt = `
//   Analyze this image for civic infrastructure issues and public safety hazards.
  
//   CRITICAL INSTRUCTION: First, check image quality.
//   1. IF BLURRY/BLACK SCREEN: Return { "issue": "Image Unclear", "severity": 0, "description": "Image is too blurry or dark to analyze." }

//   2. SEARCH FOR THESE SPECIFIC HAZARDS:
  
//   - **Street Light Issues:** Broken poles, hanging wires, or non-functional lights (if night time).
//   - **Road Hazards:** Deep potholes, open manholes, waterlogging, dangerous cracks.
//   - **Sanitation:** Garbage dumps, overflowing sewage.
//   - **Public Safety (Women/Pedestrians):** - "Dark/Unlit Street" (if the image is clear but shows a street with no working lights at night).
//      - "Desolate/Unsafe Route" (isolated areas with broken infrastructure that look dangerous).
  
//   3. OUTPUT FORMAT (JSON ONLY):
//   { 
//     "issue": "Short Title (e.g. Broken Streetlight, Dark Street, Pothole)", 
//     "description": "2 sentence explanation of the hazard and why it is unsafe.", 
//     "severity": Number (1-10)
//   }
  
//   **Severity Guide:**
//   - 8-10: Immediate danger (Open manhole, Live wire, Total darkness in alley).
//   - 4-7: Moderate danger (Pothole, Garbage pile).
//   - 1-3: Minor issue (Faded road markings).
// `;
  
//     const result = await model.generateContent([prompt, imagePart]);//result in json
//     const response = await result.response;
//     const text = response.text();
    

//     const cleanText=text.replace(/```json|```/g,"").trim();//cleaning the text
    
//     return JSON.parse(cleanText);

//    }
//    catch(e){
//     console.error("Error fetching the detail ",e);
//     return null;
//    }
// }

// async function fileToGenerativePart(file) {//function to convert the image file to its text data
//   return new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.onloadend = () => resolve({
//       inlineData: { data: reader.result.split(',')[1], mimeType: file.type },
//     });
//     reader.readAsDataURL(file);
//   });
// }