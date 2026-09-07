import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Usuario } from '../Types/Usuario';
import { AuthService } from '../Services/AuthService';

interface AuthContextType {
  usuario: Usuario | null;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuarioLina');
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password?: string): Promise<boolean> => {
    const normalizedUsername = username.trim();
    const normalizedPassword = (password ?? '').trim();

    if (!normalizedUsername || !normalizedPassword) {
      throw new Error('Ingresa tu usuario y contraseña.');
    }

    try {
      const user = await AuthService.login(normalizedUsername, normalizedPassword);
      setUsuario(user);
      localStorage.setItem('usuarioLina', JSON.stringify(user));
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const match = error.message.match(/API Error:\s+\d+\s+-\s+(.+)$/);
        if (match?.[1]) {
          try {
            const parsed = JSON.parse(match[1]) as { mensaje?: string };
            throw new Error(parsed.mensaje || 'No se pudo iniciar sesión.');
          } catch {
            throw new Error(match[1]);
          }
        }
        throw error;
      }

      throw new Error('No se pudo iniciar sesión.');
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuarioLina');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isAuthenticated: !!usuario }}>
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
