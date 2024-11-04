import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  sellerName: string;
  category?: string;
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        defaultSource={require('../../assets/placeholder.png')}
      />
      
      {product.category && (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>
        
        <Text style={styles.price}>
          ${product.price.toLocaleString()}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.sellerInfo}>
            <Ionicons name="person-circle-outline" size={20} color="#666" />
            <Text style={styles.sellerName} numberOfLines={1}>
              {product.sellerName}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.chatButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  categoryContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  price: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerName: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  chatButton: {
    padding: 5,
  },
});