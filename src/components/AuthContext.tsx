import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/auth';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'company_user';
  companyId?: string;
  isActive: boolean;
  permissions?: {
    canViewAllCompanyProjects: boolean;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión activa al cargar
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
          companyId: currentUser.company_id,
          isActive: currentUser.is_active,
          permissions: currentUser.permissions
        });
      }
    } catch (error) {
      console.error('Error inicializando auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user: authUser, error } = await AuthService.login(email, password);
      
      if (error || !authUser) {
        console.error('Error de login:', error);
        return false;
      }

      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        role: authUser.role,
        companyId: authUser.company_id,
        isActive: authUser.is_active,
        permissions: authUser.permissions
      });
      
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};