import type { ColumnDef } from '../../../../Components/ERP/DataTable';
import type { Usuario } from '../../../../Types/Usuario';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import { StatusBadge, RoleBadge } from '../../../../Components/ERP/StatusBadge';
import UsersActions from './UsersActions';
import type { SortConfig } from '../../../../Hooks/useDataTable';
import { formatDate } from '../../../../Utils/formatters';
import '../../../../Styles/ERP/erp-table.css';

interface UsersTableProps {
  data: Usuario[];
  totalItems: number;
  sortConfig: SortConfig<Usuario>;
  onSort: (key: keyof Usuario) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (user: Usuario) => void;
  onEdit: (user: Usuario) => void;
  onDelete: (user: Usuario) => void;
}

const COLUMNS: ColumnDef<Usuario>[] = [
  {
    key: 'username',
    header: 'Usuario',
    sortable: true,
    render: (row) => (
      <div>
        <div className="cell-main">@{row.username}</div>
        <div className="cell-sub">{row.email}</div>
      </div>
    ),
  },
  {
    key: 'nombres',
    header: 'Nombre completo',
    sortable: true,
    render: (row) => `${row.nombres} ${row.apellidos}`,
  },
  {
    key: 'rol',
    header: 'Rol',
    sortable: true,
    render: (row) => <RoleBadge role={row.rol} />,
  },
  {
    key: 'estado',
    header: 'Estado',
    sortable: true,
    render: (row) => <StatusBadge status={row.estado} />,
  },
  {
    key: 'sucursal',
    header: 'Sucursal',
    sortable: true,
  },
  {
    key: 'createdAt',
    header: 'Registrado',
    sortable: true,
    render: (row) => (
      <span style={{ fontSize: '12px', color: 'var(--erp-text-muted)' }}>
        {formatDate(row.createdAt)}
      </span>
    ),
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '100px',
    render: (row, _, onView?: any, onEdit?: any, onDelete?: any) => (
      <UsersActions
        user={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];

const UsersTable = ({
  data,
  totalItems,
  sortConfig,
  onSort,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onDelete,
}: UsersTableProps) => {
  // Build columns with action callbacks baked in
  const columns: ColumnDef<Usuario>[] = COLUMNS.map(col => {
    if (col.key === 'actions') {
      return {
        ...col,
        render: (row) => (
          <UsersActions
            user={row}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      };
    }
    return col;
  });

  return (
    <div className="erp-table-card">
      <DataTable<Usuario>
        columns={columns}
        data={data}
        sortConfig={sortConfig}
        onSort={onSort}
        rowKey={(row) => row.id}
        emptyMessage="No se encontraron usuarios con los filtros actuales"
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default UsersTable;
