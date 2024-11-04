import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { User } from '../types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [userData, setUserData] = useState<User | null>(null);
  const auth = getAuth();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (!auth.currentUser) return;
    
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          id: userDoc.id,
          userName: data.userName || '',
          email: data.email || '',
          userType: data.userType || 'cliente',
          photoURL: data.photoURL,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, cerrar sesión',
          style: 'destructive',
          onPress: () => auth.signOut(),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: userData?.photoURL || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{userData?.userName || 'Usuario'}</Text>
        <Text style={styles.userType}>
          {userData?.userType === 'emprendedor' ? 'Emprendedor' : 'Cliente'}
        </Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="person-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Editar Perfil</Text>
        </TouchableOpacity>

        {userData?.userType === 'emprendedor' && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyProducts')}
          >
            <Ionicons name="grid-outline" size={24} color="#007AFF" />
            <Text style={styles.menuText}>Mis Productos</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Chat', { 
            userId: userData?.id || '', 
            userName: userData?.userName || ''
          })}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Mis Mensajes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Configuración</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={[styles.menuText, styles.logoutText]}>
            Cerrar Sesión
          </Text>
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userType: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  logoutButton: {
    marginTop: 20,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF3B30',
  },
});