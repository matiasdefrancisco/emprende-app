import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { pickImage, uploadToCloudinary } from '../utils/cloudinaryService';

type AddProductScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddProduct'>;

interface AddProductScreenProps {
  navigation: AddProductScreenNavigationProp;
}

export default function AddProductScreen({ navigation }: AddProductScreenProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const handleImagePick = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri) {
        setImage(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del producto');
      return false;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un precio válido');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return false;
    }
    if (!image) {
      Alert.alert('Error', 'Por favor selecciona una imagen');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Subir imagen a Cloudinary
      const imageUrl = await uploadToCloudinary(image);
      
      // Guardar datos en Firestore
      const db = getFirestore();
      await addDoc(collection(db, 'products'), {
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        category: category.trim(),
        imageUrl,
        sellerId: auth.currentUser?.uid,
        sellerName: auth.currentUser?.displayName,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('¡Éxito!', 'Producto publicado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            setName('');
            setPrice('');
            setDescription('');
            setCategory('');
            setImage(null);
            // Navegar al home después de publicar
            navigation.navigate('Home');
          }
        }
      ]);
    } catch (error) {
      console.error('Error al publicar producto:', error);
      Alert.alert('Error', 'No se pudo publicar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Publicar Producto</Text>

      <TouchableOpacity style={styles.imageContainer} onPress={handleImagePick}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={40} color="#666" />
            <Text style={styles.imagePlaceholderText}>
              Toca para agregar imagen
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        value={name}
        onChangeText={setName}
        maxLength={50}
      />

      <TextInput
        style={styles.input}
        placeholder="Precio"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        maxLength={10}
      />

      <TextInput
        style={styles.input}
        placeholder="Categoría (opcional)"
        value={category}
        onChangeText={setCategory}
        maxLength={30}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción del producto"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (loading || !name || !price || !description || !image) && styles.buttonDisabled
        ]}
        onPress={handleSubmit}
        disabled={loading || !name || !price || !description || !image}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Publicar Producto</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.characterCount}>
        {description.length}/500 caracteres
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#e1e1e1',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  characterCount: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 20,
  },
});