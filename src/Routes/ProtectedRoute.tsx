import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import type { RolUsuario } from '../Types/Usuario';

interface Props {
  children: JSX.Element;
  rolesPermitidos?: RolUsuario[];
}

export const ProtectedRoute = ({ children, rolesPermitidos }: Props) => {
  const { usuario, isAuthenticated } = useAuth();

  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
