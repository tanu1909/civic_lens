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

export const updateReportStatus = async (id, newStatus) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .update({ status: newStatus })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Update Error:", error);
        throw error;
    }
};