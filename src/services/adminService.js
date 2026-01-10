// import { supabase } from '../supabaseClient';

// export const fetchAllReports = async () => {
//     try {
//         const { data, error } = await supabase
//             .from('reports')
//             .select('*')
//             .order('created_at', { ascending: false });

//         if (error) throw error;
//         return data;
//     } catch (error) {
//         console.error("Fetch Error:", error);
//         return [];
//     }
// };

// export const updateReportStatus = async (id, newStatus) => {
//     try {
//         const { data, error } = await supabase
//             .from('reports')
//             .update({ status: newStatus })
//             .eq('id', id)
//             .select();

//         if (error) throw error;
//         return data;
//     } catch (error) {
//         console.error("Update Error:", error);
//         throw error;
//     }
// };


import { supabase } from '../supabaseClient';

export const fetchAllReports = async () => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
};

/**
 * Updates status, resolution timestamp, and verification image
 */
export const updateReportStatus = async (id, newStatus, resolvedAt = null, resolutionImage = null) => {
    try {
        // Ensure the keys match your Supabase column names exactly
        const updateData = { 
            status: newStatus,
            resolved_at: resolvedAt, // or 'timestamptz' depending on your table
            resolution_image: resolutionImage 
        };

        const { data, error } = await supabase
            .from('reports')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Update Error:", error);
        throw error;
    }
};

/**
 * Uploads the "Proof of Work" image to Supabase Storage
 */
export const uploadResolutionImage = async (file, reportId) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `resolutions/${reportId}-${Math.random()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('report-images') // Ensure this bucket exists in Supabase
            .upload(fileName, file);

        if (error) throw error;

        // Get Public URL
        const { data: urlData } = supabase.storage
            .from('report-images')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    } catch (error) {
        console.error("Upload Error:", error);
        return null;
    }
};