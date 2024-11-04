import * as ImagePicker from 'expo-image-picker';

// Reemplaza estos valores con los tuyos de Cloudinary
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/tu_cloud_name/upload';
const UPLOAD_PRESET = 'tu_upload_preset';

interface CloudinaryResponse {
  secure_url: string;
  error?: string;
}

export const pickImage = async (): Promise<string | null> => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      throw new Error('Se necesita permiso para acceder a la galería');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

export const uploadToCloudinary = async (uri: string): Promise<string> => {
  try {
    const formData = new FormData();
    
    // Crear el archivo para subir
    const localUri = uri;
    const filename = localUri.split('/').pop() || 'image';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image';

    // @ts-ignore
    formData.append('file', {
      uri: localUri,
      name: filename,
      type,
    });

    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    const data: CloudinaryResponse = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};