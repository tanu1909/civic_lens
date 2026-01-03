/* * REPORT SERVICE (SUPABASE VERSION)
 * Handles saving reports to Supabase Database & Storage.
 */

import {createClient} from '@supabase/supabase-js' 


const supabaseUrl=import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);


//  Image Upload Function 
export const uploadImageToStorage=async(imageFile)=>{
try{

    const fileName = `${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;


    const {data ,error }=await supabase.storage
    .from('images')
    .upload(fileName,imageFile);

    if(error) throw error;

    const {data:urlData}=supabase.storage
    .from('images')
    .getPublicUrl(fileName);

    return urlData.publicUrl;
    }catch(e){
        console.error("uplold failed: ",e);
        throw e;
    }
  
};


// Data Save Function 
export  async function saveReport(reportData)
{   
    try{
        const {data,error}=await supabase
        .from('reports')
        .insert([{
            description: reportData.description,
            aiAnalysis: reportData.aiAnalysis, // The full AI text
            issue: reportData.issue, // Short title
            severity: parseInt(reportData.severity),
            location: reportData.location, // Store as string or JSON
            imageUrl: reportData.imageUrl,
            isSuspicious: reportData.isSuspicious,
            isSafetyHazard: reportData.isSafetyHazard,
            status: 'Pending',
            userId: reportData.userId
        }])
        .select();
        if(error) throw error;

        console.log("Report saved to supabase:",data);
        return data;
    }catch(e){
        console.log("error adding reports:",e);
        throw e;
    }
}