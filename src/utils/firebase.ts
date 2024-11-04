import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpbsDVU-oTsc1V0KMimd7y7mHkOnBM5ko",
  authDomain: "emprendeapp-778e1.firebaseapp.com",
  projectId: "emprendeapp-778e1",
  storageBucket: "emprendeapp-778e1.appspot.com", // Agregado storageBucket
  messagingSenderId: "324723206654",
  appId: "1:324723206654:web:6bbfe3f48e959193deb8af"
};

// Inicializar Firebase solo si no hay una instancia previa
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializar Auth con persistencia
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Inicializar Firestore
const db = getFirestore(app);

// Función auxiliar para verificar la autenticación
const isAuthenticated = () => {
  return auth.currentUser !== null;
};

// Función para obtener el usuario actual
const getCurrentUser = () => {
  return auth.currentUser;
};

export { auth, db, isAuthenticated, getCurrentUser };

// Tipos para TypeScript
export type FirebaseUser = ReturnType<typeof getCurrentUser>;
export type FirebaseAuth = typeof auth;
export type FirebaseDB = typeof db;