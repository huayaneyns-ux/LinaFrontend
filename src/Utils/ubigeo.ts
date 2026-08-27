import departamentosData from '../Constantes/Data/ubigeo/ubigeo_departamentos.json';
import provinciasData from '../Constantes/Data/ubigeo/ubigeo_provincias.json';
import distritosData from '../Constantes/Data/ubigeo/ubigeo_distrito.json';

export interface UbigeoItem {
  id: string;
  name: string;
}

export interface UbigeoProvinciaItem extends UbigeoItem {
  department_id: string;
}

export interface UbigeoDistritoItem extends UbigeoItem {
  province_id: string;
  department_id: string;
}

export const departamentos: UbigeoItem[] = departamentosData;
export const provincias: UbigeoProvinciaItem[] = provinciasData;
export const distritos: UbigeoDistritoItem[] = distritosData;

const normalizeText = (text?: string): string =>
  (text || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * Encuentra un departamento por ID o por Nombre.
 */
export function findDepartment(idOrName?: string): UbigeoItem | undefined {
  if (!idOrName) return undefined;
  const target = normalizeText(idOrName);
  return departamentos.find(
    (d) => d.id === idOrName.trim() || normalizeText(d.name) === target,
  );
}

/**
 * Obtiene todas las provincias correspondientes a un departamento (por ID o nombre).
 */
export function getProvincesByDepartment(departmentIdOrName?: string): UbigeoProvinciaItem[] {
  const dept = findDepartment(departmentIdOrName);
  if (!dept) return [];
  return provincias.filter((p) => p.department_id === dept.id);
}

/**
 * Encuentra una provincia dentro de un departamento por ID o Nombre.
 */
export function findProvince(
  departmentIdOrName?: string,
  provinceIdOrName?: string,
): UbigeoProvinciaItem | undefined {
  if (!provinceIdOrName) return undefined;
  const provList = getProvincesByDepartment(departmentIdOrName);
  const target = normalizeText(provinceIdOrName);
  return provList.find(
    (p) => p.id === provinceIdOrName.trim() || normalizeText(p.name) === target,
  );
}

/**
 * Obtiene todos los distritos correspondientes a una provincia (y departamento opcional).
 */
export function getDistrictsByProvince(
  provinceIdOrName?: string,
  departmentIdOrName?: string,
): UbigeoDistritoItem[] {
  const prov = findProvince(departmentIdOrName, provinceIdOrName);
  if (!prov) {
    if (provinceIdOrName) {
      const target = normalizeText(provinceIdOrName);
      const matched = provincias.find(
        (p) => p.id === provinceIdOrName.trim() || normalizeText(p.name) === target,
      );
      if (matched) {
        return distritos.filter((d) => d.province_id === matched.id);
      }
    }
    return [];
  }
  return distritos.filter((d) => d.province_id === prov.id);
}

/**
 * Encuentra un distrito específico dentro de una provincia.
 */
export function findDistrict(
  departmentIdOrName?: string,
  provinceIdOrName?: string,
  districtIdOrName?: string,
): UbigeoDistritoItem | undefined {
  if (!districtIdOrName) return undefined;
  const distList = getDistrictsByProvince(provinceIdOrName, departmentIdOrName);
  const target = normalizeText(districtIdOrName);
  const inList = distList.find(
    (d) => d.id === districtIdOrName.trim() || normalizeText(d.name) === target,
  );
  if (inList) return inList;

  // Fallback: search globally if not found in filtered list
  return distritos.find(
    (d) => d.id === districtIdOrName.trim() || normalizeText(d.name) === target,
  );
}

/**
 * Retorna el código de ubigeo de 6 dígitos de SUNAT (ej. "150101", "010102").
 */
export function getUbigeoCode(
  departamento?: string,
  provincia?: string,
  distrito?: string,
  fallback = '150101',
): string {
  // Si ya es un código de 6 dígitos
  if (distrito && /^\d{6}$/.test(distrito.trim())) {
    return distrito.trim();
  }

  const foundDistrict = findDistrict(departamento, provincia, distrito);
  if (foundDistrict) {
    return foundDistrict.id;
  }

  // Si no se encuentra, intentar buscar por nombre de distrito globalmente
  if (distrito) {
    const target = normalizeText(distrito);
    const globalMatch = distritos.find(
      (d) => d.id === distrito.trim() || normalizeText(d.name) === target,
    );
    if (globalMatch) return globalMatch.id;
  }

  return fallback;
}
