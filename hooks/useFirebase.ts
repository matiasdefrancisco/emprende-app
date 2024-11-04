import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../utils/firebase';

interface FirebaseHookReturn {
  auth: typeof auth;
  db: typeof db;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useFirebase(): FirebaseHookReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    auth,
    db,
    user,
    loading,
    isAuthenticated: !!user
  };
}

// Exportar tipos para uso en otros componentes
export type { FirebaseHookReturn };