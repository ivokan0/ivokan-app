import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

import { supabase } from './supabase';

// Fonction pour compresser une image
export const compressImage = async (uri: string, quality: number = 0.7): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 400, height: 400 } }], // Redimensionner à 400x400
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    throw error;
  }
};

// Fonction pour uploader un avatar
export const uploadAvatar = async (
  userId: string,
  imageUri: string,
  compress: boolean = true
): Promise<{ data: string | null; error: any }> => {
  try {
    // Compresser l'image si demandé
    const finalUri = compress ? await compressImage(imageUri) : imageUri;
    
    // Lire le fichier
    const fileInfo = await FileSystem.getInfoAsync(finalUri);
    if (!fileInfo.exists) {
      throw new Error('Le fichier n\'existe pas');
    }

    // Générer un nom de fichier unique
    const fileExt = finalUri.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;

    // Lire le fichier en base64
    const base64 = await FileSystem.readAsStringAsync(finalUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convertir en Uint8Array
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, byteArray, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (error) {
      return { data: null, error };
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { data: urlData.publicUrl, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Fonction pour supprimer un avatar
export const deleteAvatar = async (avatarUrl: string): Promise<{ error: any }> => {
  try {
    // Extraire le nom du fichier depuis l'URL
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1]; // filename.ext

    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Helper function to map file extensions to supported MIME types
const getSupportedMimeType = (fileName: string, originalType: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  // If original type is already supported, use it
  if (originalType && originalType !== 'application/octet-stream') {
    return originalType;
  }
  
  // Map extensions to supported MIME types
  const mimeTypeMap: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'rtf': 'application/rtf',
    'json': 'application/json',
    'xml': 'application/xml',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp'
  };
  
  return mimeTypeMap[extension || ''] || 'application/pdf';
};

// Fonction pour uploader des documents de leçon
export const uploadLessonDocuments = async (
  files: Array<{ uri: string; name: string; type: string }>,
  userId?: string
): Promise<{ data: string[] | null; error: any }> => {
  try {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Lire le fichier
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (!fileInfo.exists) {
        throw new Error(`Le fichier ${file.name} n'existe pas`);
      }

      // Générer un nom de fichier unique avec user ID pour organisation
      const fileExt = file.name.split('.').pop() || 'pdf';
      const userPrefix = userId ? `${userId}/` : '';
      const fileName = `${userPrefix}lesson_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Lire le fichier en base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convertir en Uint8Array
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Use the helper function to get a supported MIME type
      const contentType = getSupportedMimeType(file.name, file.type);
      
      // Log the final content type for debugging
      console.log(`File: ${file.name}, Extension: ${fileExt}, Original Type: ${file.type}, Final Content Type: ${contentType}`);

      // Try lessons-documents bucket first, fallback to avatars if needed
      let uploadResult;
      try {
        console.log(`Attempting to upload ${fileName} with content type: ${contentType}`);
        uploadResult = await supabase.storage
          .from('lessons-documents')
          .upload(fileName, byteArray, {
            contentType,
            upsert: false,
          });
      } catch (bucketError) {
        console.warn('lessons-documents bucket not available, using avatars bucket:', bucketError);
        // Fallback to avatars bucket for now
        uploadResult = await supabase.storage
          .from('avatars')
          .upload(`lesson_${fileName}`, byteArray, {
            contentType,
            upsert: false,
          });
      }

      if (uploadResult.error) {
        throw uploadResult.error;
      }

      // Get public URL from the appropriate bucket
      let publicUrl;
      if (uploadResult.data) {
        const bucketName = uploadResult.data.path.includes('lesson_') ? 'avatars' : 'lessons-documents';
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(uploadResult.data.path);
        publicUrl = urlData.publicUrl;
      }

      if (publicUrl) {
        uploadedUrls.push(publicUrl);
      }
    }

    return { data: uploadedUrls, error: null };
  } catch (error) {
    console.error('Error in uploadLessonDocuments:', error);
    return { data: null, error };
  }
};
