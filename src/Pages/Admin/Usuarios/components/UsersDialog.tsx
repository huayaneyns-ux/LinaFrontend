import { useRef, useState } from 'react';
import type { DialogMode } from '../../../../Hooks/useDialog';
import type { Usuario, UsuarioFormData } from '../../../../Types/Usuario';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import UsersForm from './UsersForm';

interface UsersDialogProps {
  isOpen: boolean;
  mode: DialogMode;
  record: Usuario | null;
  onClose: () => void;
  onCreate: (data: UsuarioFormData) => void;
  onUpdate: (id: string, data: UsuarioFormData) => void;
  onDelete: (id: string) => void;
}

const MODE_TITLES: Record<DialogMode, string> = {
  create: 'Nuevo usuario',
  edit:   'Editar usuario',
  view:   'Detalle de usuario',
  delete: 'Eliminar usuario',
};

const MODE_SUBTITLES: Partial<Record<DialogMode, string>> = {
  create: 'Completa los campos para registrar un nuevo usuario',
  edit:   'Modifica los datos del usuario seleccionado',
  view:   'Información completa del usuario',
};

const UsersDialog = ({
  isOpen,
  mode,
  record,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: UsersDialogProps) => {
  const formDataRef = useRef<UsuarioFormData | null>(null);
  const [hasErrors, setHasErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (mode === 'delete' && record) {
      setLoading(true);
      // Simulate async
      await new Promise(r => setTimeout(r, 300));
      onDelete(record.id);
      setLoading(false);
      onClose();
      return;
    }

    if (mode === 'view') {
      onClose();
      return;
    }

    if (hasErrors || !formDataRef.current) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    if (mode === 'create') {
      onCreate(formDataRef.current);
    } else if (mode === 'edit' && record) {
      onUpdate(record.id, formDataRef.current);
    }

    setLoading(false);
    onClose();
  };

  const deleteMessage = record ? (
    <>
      Estás a punto de eliminar al usuario{' '}
      <span className="erp-delete-highlight">
        {record.nombres} {record.apellidos}
      </span>{' '}
      (<span className="erp-delete-highlight">@{record.username}</span>). Esta acción no se puede deshacer.
    </>
  ) : undefined;

  return (
    <CrudDialog
      isOpen={isOpen}
      mode={mode}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={MODE_TITLES[mode]}
      subtitle={MODE_SUBTITLES[mode]}
      deleteMessage={deleteMessage}
      loading={loading}
      size="lg"
      confirmLabel={mode === 'create' ? 'Crear usuario' : mode === 'edit' ? 'Guardar cambios' : undefined}
    >
      <UsersForm
        mode={mode}
        record={record}
        onDataChange={data => { formDataRef.current = data; }}
        onErrorsChange={setHasErrors}
      />
    </CrudDialog>
  );
};

export default UsersDialog;
