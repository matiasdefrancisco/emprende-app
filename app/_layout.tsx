import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter, useSegments } from 'expo-router';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpbsDVU-oTsc1V0KMimd7y7mHkOnBM5ko",
  authDomain: "emprendeapp-778e1.firebaseapp.com",
  projectId: "emprendeapp-778e1",
  storageBucket: "emprendeapp-778e1.appspot.com",
  messagingSenderId: "324723206654",
  appId: "1:324723206654:web:6bbfe3f48e959193deb8af"
};

// Inicializar Firebase
initializeApp(firebaseConfig);
const auth = getAuth();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Aquí puedes agregar fuentes personalizadas si las necesitas
  });
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!loaded) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!user && !inAuthGroup) {
        // Redirigir a login si no está autenticado
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        // Redirigir al home si está autenticado
        router.replace('/(tabs)');
      }
    });

    return unsubscribe;
  }, [loaded, segments]);

  if (!loaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}