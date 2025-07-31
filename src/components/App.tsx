import { AuthProvider, useAuth } from './components/AuthContext';
import LoginForm from './components/LoginForm';
import { useEffect } from 'react';

function AppWrapper() {
  useEffect(() => {
    // Verificar que las variables de entorno estén configuradas
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('⚠️ Variables de Supabase no configuradas. Verifica tu archivo .env');
    }
  }, []);

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}