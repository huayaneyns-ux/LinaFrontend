import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Usuario } from '../Types/Usuario';
import { mockUsuarios } from '../Constantes/Data/MockData';

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
    // Simulación de fetch a API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsuarios.find(u => u.username === username);
        if (user) {
          // Validar contraseña
          if (user.password === password || password === '123') { // 123 como fallback temporal
            setUsuario(user);
            localStorage.setItem('usuarioLina', JSON.stringify(user));
            resolve(true);
          } else {
            reject(new Error("Contraseña incorrecta"));
          }
        } else {
          reject(new Error("Usuario no encontrado (usa: juancliente o admin)"));
        }
      }, 500); // 500ms delay para simular red
    });
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
