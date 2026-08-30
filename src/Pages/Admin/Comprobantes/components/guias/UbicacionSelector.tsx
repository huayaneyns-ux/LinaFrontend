import { useMemo, type ReactNode } from 'react';

import FormField from '../../../../../Components/ERP/FormField';
import {
  departamentos,
  findDepartment,
  findDistrict,
  findProvince,
  getDistrictsByProvince,
  getProvincesByDepartment,
} from '../../../../../Utils/ubigeo';

interface Props {
  label: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  ubigeo?: string;

  onDepartamentoChange: (v: string) => void;
  onProvinciaChange: (v: string) => void;
  onDistritoChange: (v: string) => void;
  onDireccionChange: (v: string) => void;
  onUbigeoChange?: (v: string) => void;

  errors?: {
    direccion?: string;
  };

  additionalFields?: ReactNode;
}

const UbicacionSelector = ({
  label,
  departamento,
  provincia,
  distrito,
  direccion,
  onDepartamentoChange,
  onProvinciaChange,
  onDistritoChange,
  onDireccionChange,
  onUbigeoChange,
  errors,
  additionalFields,
}: Props) => {
  // Encontrar departamento seleccionado (por ID o por Nombre)
  const currentDept = useMemo(
    () => findDepartment(departamento) || departamentos[0],
    [departamento],
  );

  // Lista de provincias filtradas por el departamento actual
  const currentProvinces = useMemo(
    () => getProvincesByDepartment(currentDept?.id),
    [currentDept],
  );

  // Encontrar provincia seleccionada dentro del departamento actual
  const currentProv = useMemo(
    () =>
      findProvince(currentDept?.id, provincia) ||
      currentProvinces[0] ||
      undefined,
    [currentDept, provincia, currentProvinces],
  );

  // Lista de distritos filtrados por la provincia actual
  const currentDistricts = useMemo(
    () => getDistrictsByProvince(currentProv?.id, currentDept?.id),
    [currentProv, currentDept],
  );

  // Encontrar distrito seleccionado dentro de la provincia actual
  const currentDist = useMemo(
    () =>
      findDistrict(currentDept?.id, currentProv?.id, distrito) ||
      currentDistricts[0] ||
      undefined,
    [currentDept, currentProv, distrito, currentDistricts],
  );

  const handleDepartmentChange = (deptName: string) => {
    const dept = findDepartment(deptName);
    if (!dept) {
      onDepartamentoChange(deptName);
      return;
    }

    const provList = getProvincesByDepartment(dept.id);
    const firstProv = provList[0];
    const distList = firstProv
      ? getDistrictsByProvince(firstProv.id, dept.id)
      : [];
    const firstDist = distList[0];

    onDepartamentoChange(dept.name);
    onProvinciaChange(firstProv ? firstProv.name : '');
    onDistritoChange(firstDist ? firstDist.name : '');

    if (onUbigeoChange && firstDist) {
      onUbigeoChange(firstDist.id);
    }
  };

  const handleProvinceChange = (provName: string) => {
    const prov = findProvince(currentDept?.id, provName);
    if (!prov) {
      onProvinciaChange(provName);
      return;
    }

    const distList = getDistrictsByProvince(prov.id, currentDept?.id);
    const firstDist = distList[0];

    onProvinciaChange(prov.name);
    onDistritoChange(firstDist ? firstDist.name : '');

    if (onUbigeoChange && firstDist) {
      onUbigeoChange(firstDist.id);
    }
  };

  const handleDistrictChange = (distName: string) => {
    const dist = findDistrict(currentDept?.id, currentProv?.id, distName);
    onDistritoChange(dist ? dist.name : distName);

    if (onUbigeoChange && dist) {
      onUbigeoChange(dist.id);
    }
  };

  return (
    <section
      style={{
        padding: '16px',
        border: '1px solid var(--erp-border)',
        borderRadius: '8px',
        backgroundColor: 'var(--erp-surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--erp-text-primary)',
          }}
        >
          {label}
        </h4>
        {currentDist && (
          <span
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              backgroundColor: 'var(--erp-bg-subtle, #f1f5f9)',
              borderRadius: '4px',
              color: 'var(--erp-text-secondary)',
              fontWeight: 500,
            }}
          >
            Ubigeo: <strong>{currentDist.id}</strong>
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        <FormField label="Departamento" required>
          <select
            className="erp-form-control"
            value={currentDept?.name || departamento}
            onChange={(e) => handleDepartmentChange(e.target.value)}
          >
            {departamentos.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Provincia" required>
          <select
            className="erp-form-control"
            value={currentProv?.name || provincia}
            onChange={(e) => handleProvinceChange(e.target.value)}
          >
            {currentProvinces.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Distrito" required>
          <select
            className="erp-form-control"
            value={currentDist?.name || distrito}
            onChange={(e) => handleDistrictChange(e.target.value)}
          >
            {currentDistricts.map((dist) => (
              <option key={dist.id} value={dist.name}>
                {dist.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Dirección"
          required
          error={errors?.direccion}
        >
          <input
            className="erp-form-control"
            placeholder="Av. / Jr. / Calle y número"
            value={direccion}
            onChange={(e) => onDireccionChange(e.target.value)}
          />
        </FormField>

        {additionalFields}
      </div>
    </section>
  );
};

export default UbicacionSelector;