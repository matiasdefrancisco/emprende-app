import * as ImagePicker from 'expo-image-picker';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/TU_CLOUD_NAME/upload';
const UPLOAD_PRESET = 'tu_upload_preset'; // Lo configuraremos en Cloudinary

export const uploadImage = async (uri: string): Promise<string> => {
  try {
    const formData = new FormData();
    const extension = uri.split('.').pop();
    const filename = `photo-${Date.now()}.${extension}`;

    // @ts-ignore
    formData.append('file', {
      uri,
      name: filename,
      type: `image/${extension}`
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    });

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

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
      base64: true,
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