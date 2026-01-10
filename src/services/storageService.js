import { supabase } from '../supabaseClient';

export async function uploadResolvedImage(file, reportId) {
  const fileExt = file.name.split('.').pop();
  const fileName = `resolved/${reportId}_${Date.now()}.${fileExt}`;

  // Upload image
  const { error } = await supabase.storage
    .from('resolutions')
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  // Get public URL
  const { data } = supabase.storage
    .from('resolutions')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
