/* * REPORT SERVICE
 * Handles saving AI reports to Firebase.
 */

import {db,storage} from './firebase';
import {collection,addDoc,serverTimestamp} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 

//  Image Upload Function 
export const uploadImageToStorage=async(imageFile)=>{
try{
  const storageRef = ref(storage, `reports/${Date.now()}_${imageFile.name}`);
  const snapshot = await uploadBytes(storageRef, imageFile);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
    }catch(e){
        console.log("uplold failed: ",e);
        throw e;
    }
  
};
// Data Save Function 
export  async function saveReport(userId,imageUrl,aiDescription,location)
{   console.log("saving......",userId,imageUrl,location);
    const aiScore = finalReport.aiSeverity || 0;
    const userScore = finalReport.userSeverity || 0;
    const mismatch = Math.abs(aiScore - userScore);
    const isSuspicious = mismatch > 4;
    try{
        if (!db) {
        throw new Error("Firebase DB connection is missing!");
    }
        const doRef=await addDoc(collection(db,"reports"),{
            userId:userId||"anonymous",
            imageUrl:imageUrl,
            issue:aiDescription?.issue||"General Issue",
            description: aiDescription?.description || "No details",
            severity: userScore,
            aiConfidenceScore:aiScore,
            isSuspicious:isSuspicious,
            sSafetyHazard: aiDescription.isSafetyHazard||false,
            location:location,
            status:"pending",
            createdAt:serverTimestamp()
        });
        console.log("docref, ", doRef);
        console.log("Report saved. ID:", doRef.id, "| Suspicious?", isSuspicious);

        return doRef.id;
    }
    catch(e){
        console.error("Error adding report:",e);
        throw e;
    }

}