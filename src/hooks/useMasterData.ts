import { useMasterStore } from '@/stores/masterStore';
import { useMemo } from 'react';

/**
 * Hook to get active dropdown options from Master Database.
 * Use in forms to replace hardcoded dropdown values.
 *
 * Example:
 *   const cityOptions = useMasterOptions('city');
 *   const cities = useMasterValues('mt_city');
 */
export function useMasterValues(typeSlug: string) {
  return useMasterStore(s => {
    const type = s.masterTypes.find(mt => mt.slug === typeSlug);
    if (!type) return [];
    return s.masterValues
      .filter(v => v.masterTypeId === type.id && v.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  });
}

export function useMasterValuesById(typeId: string) {
  return useMasterStore(s =>
    s.masterValues
      .filter(v => v.masterTypeId === typeId && v.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );
}

export function useMasterOptions(typeSlug: string) {
  const values = useMasterValues(typeSlug);
  return useMemo(() =>
    values.map(v => ({
      value: v.slug,
      label: v.name,
      color: v.color,
      id: v.id,
      parentId: v.parentId,
    })),
    [values]
  );
}

export function useMasterOptionsById(typeId: string) {
  const values = useMasterValuesById(typeId);
  return useMemo(() =>
    values.map(v => ({
      value: v.slug,
      label: v.name,
      color: v.color,
      id: v.id,
      parentId: v.parentId,
    })),
    [values]
  );
}

export function useMasterChildren(parentId?: string) {
  return useMasterStore(s =>
    s.masterValues
      .filter(v => v.parentId === parentId && v.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );
}

export function useMasterType(slug: string) {
  return useMasterStore(s => s.masterTypes.find(mt => mt.slug === slug));
}

export function useAllMasterTypes() {
  return useMasterStore(s =>
    s.masterTypes
      .filter(mt => mt.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );
}
