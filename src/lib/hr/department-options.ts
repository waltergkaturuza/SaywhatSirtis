export interface HrDepartmentOption {
  id: string
  name: string
  displayLabel: string
}

/** Load active departments and subunits from HR (names match `documents.department` when aligned). */
export async function fetchHrDepartmentOptions(): Promise<HrDepartmentOption[]> {
  const res = await fetch('/api/hr/departments/hierarchy')
  if (!res.ok) throw new Error('Failed to load departments')
  const payload = await res.json()
  const flat = payload?.data?.flat
  if (!Array.isArray(flat)) return []

  const opts: HrDepartmentOption[] = flat.map(
    (d: { id: string; name: string; displayName?: string }) => ({
      id: d.id,
      name: d.name,
      displayLabel: (d.displayName || d.name) as string,
    })
  )

  opts.sort((a, b) => a.displayLabel.localeCompare(b.displayLabel, undefined, { sensitivity: 'base' }))
  return opts
}
