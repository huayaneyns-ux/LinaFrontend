import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import IconButton from '../../../../Components/ERP/IconButton';
import type { Usuario } from '../../../../Types/Usuario';

interface UsersActionsProps {
  user: Usuario;
  onView: (user: Usuario) => void;
  onEdit: (user: Usuario) => void;
  onDelete: (user: Usuario) => void;
}

const UsersActions = ({ user, onView, onEdit, onDelete }: UsersActionsProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
      <IconButton
        icon={<FiEye />}
        tooltip="Ver detalle"
        variant="primary"
        onClick={() => onView(user)}
        id={`btn-view-${user.id}`}
      />
      <IconButton
        icon={<FiEdit2 />}
        tooltip="Editar usuario"
        variant="warning"
        onClick={() => onEdit(user)}
        id={`btn-edit-${user.id}`}
      />
      <IconButton
        icon={<FiTrash2 />}
        tooltip="Eliminar usuario"
        variant="danger"
        onClick={() => onDelete(user)}
        id={`btn-delete-${user.id}`}
      />
    </div>
  );
};

export default UsersActions;
