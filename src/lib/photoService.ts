import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  filePath: string;
  fileUrl: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
}

export const uploadPhoto = async (
  file: File,
  userId: string
): Promise<UploadResult | null> => {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    // Get image dimensions
    const dimensions = await getImageDimensions(file);

    return {
      filePath,
      fileUrl: urlData.publicUrl,
      width: dimensions?.width,
      height: dimensions?.height,
      fileSize: file.size,
      mimeType: file.type
    };
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};

export const deletePhotoFromStorage = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('photos')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

const getImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = URL.createObjectURL(file);
  });
};

// Convert base64 data URL to File for migration from localStorage
export const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File | null> => {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error('Error converting data URL to file:', error);
    return null;
  }
};
