/* * REPORT SERVICE (SUPABASE VERSION)
 * Handles saving reports to Supabase Database & Storage.
 */
import { supabase } from './supabaseClient'; 

//  Image Upload Function 
export const uploadImageToStorage = async (imageFile) => {
    try {
        const fileName = `${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;

        const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, imageFile);

        if (error) throw error;

        // Correct way to get public URL in Supabase v2
        const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    } catch (e) {
        console.error("Upload failed: ", e);
        throw e;
    }
};

// Data Save Function 
export async function saveReport(reportData) {
    try {
        const { data, error } = await supabase
            .from('reports')
            .insert([{
                description: reportData.description,
                aiAnalysis: reportData.aiAnalysis,
                issue: reportData.issue,
                severity: parseInt(reportData.severity),
                location: reportData.location,
                imageUrl: reportData.imageUrl,
                isSuspicious: reportData.isSuspicious,
                isSafetyHazard: reportData.isSafetyHazard,
                status: 'Pending',
                userId: reportData.userId
            }])
            .select();

        if (error) throw error;

        console.log("Report saved to supabase:", data);
        return data;
    } catch (e) {
        console.log("Error adding reports:", e);
        throw e;
    }
}