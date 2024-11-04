import { Redirect } from 'expo-router';
import { getAuth } from 'firebase/auth';

export default function Index() {
  const auth = getAuth();
  
  if (!auth.currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/home" />;
}