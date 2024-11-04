import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

type UserType = 'cliente' | 'emprendedor';

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userType, setUserType] = useState<UserType>('cliente');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !userName) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Guardar información adicional del usuario en Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', user.uid), {
        userName,
        email,
        userType,
        createdAt: new Date().toISOString(),
      });
      
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={userName}
        onChangeText={setUserName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.userTypeContainer}>
        <TouchableOpacity 
          style={[
            styles.userTypeButton,
            userType === 'cliente' && styles.userTypeButtonActive
          ]}
          onPress={() => setUserType('cliente')}
        >
          <Text style={[
            styles.userTypeText,
            userType === 'cliente' && styles.userTypeTextActive
          ]}>Cliente</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.userTypeButton,
            userType === 'emprendedor' && styles.userTypeButtonActive
          ]}
          onPress={() => setUserType('emprendedor')}
        >
          <Text style={[
            styles.userTypeText,
            userType === 'emprendedor' && styles.userTypeTextActive
          ]}>Emprendedor</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Login')}
        style={styles.loginLink}
      >
        <Text style={styles.loginText}>
          ¿Ya tienes cuenta? Inicia sesión aquí
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  userTypeButtonActive: {
    backgroundColor: '#007AFF',
  },
  userTypeText: {
    color: '#007AFF',
    fontSize: 16,
  },
  userTypeTextActive: {
    color: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#007AFF',
    fontSize: 16,
  },
});