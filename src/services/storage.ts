import { supabase } from './supabase';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

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
