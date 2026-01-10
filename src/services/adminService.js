import { supabase } from '../supabaseClient';


export async function uploadResolutionImage(file, reportId) {
  const ext = file.name.split('.').pop();
  const path = `verified/${reportId}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('resolutions')
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('resolutions')
    .getPublicUrl(path);

  return data.publicUrl;
}


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

export const updateReportStatus = async (
  id,
  status,
  resolvedDate,
  resolutionImage
) => {
  const { error } = await supabase
    .from('reports')
    .update({
      status,
      timestamptz: resolvedDate,
      resolutionImage
    })
    .eq('id', id);

  if (error) throw error;
};