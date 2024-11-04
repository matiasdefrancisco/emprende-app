import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { RootStackParamList } from '../types';

type ProductDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
type ProductDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetails'>;

interface ProductDetailsScreenProps {
  route: ProductDetailsScreenRouteProp;
  navigation: ProductDetailsScreenNavigationProp;
}

export default function ProductDetailsScreen({ route, navigation }: ProductDetailsScreenProps) {
  const { product } = route.params;
  const [sellerData, setSellerData] = useState<any>(null);
  const auth = getAuth();

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    try {
      const db = getFirestore();
      const sellerDoc = await getDoc(doc(db, 'users', product.sellerId));
      if (sellerDoc.exists()) {
        setSellerData(sellerDoc.data());
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
    }
  };

  const handleContactSeller = () => {
    if (auth.currentUser?.uid === product.sellerId) {
      Alert.alert('Error', 'No puedes chatear con tu propio producto');
      return;
    }
    
    navigation.navigate('Chat', {
      userId: product.sellerId,
      userName: sellerData?.userName || 'Vendedor'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toLocaleString()}</Text>
        
        <View style={styles.sellerContainer}>
          <Ionicons name="person-circle-outline" size={24} color="#666" />
          <Text style={styles.sellerName}>
            {sellerData?.userName || 'Vendedor'}
          </Text>
        </View>

        {product.category && (
          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag-outline" size={20} color="#666" />
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{product.description}</Text>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactSeller}
        >
          <Ionicons name="chatbubble-outline" size={24} color="white" />
          <Text style={styles.contactButtonText}>Contactar Vendedor</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 300,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  sellerName: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});