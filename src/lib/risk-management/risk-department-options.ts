/**
 * Risk module: department dropdowns must use the same names stored in `risks.department`
 * and passed to `GET /api/risk-management/risks?department=`.
 */
export type RiskDepartmentSelectOption = {
  id: string
  /** Canonical HR department name — use as option value and for API filters */
  value: string
  /** Display label (includes parent for sub-units) */
  label: string
}

export async function fetchRiskDepartmentSelectOptions(
  init?: RequestInit
): Promise<RiskDepartmentSelectOption[]> {
  const res = await fetch('/api/hr/department/list', {
    credentials: 'include',
    ...init,
  })
  if (!res.ok) return []
  const json = (await res.json().catch(() => null)) as {
    success?: boolean
    data?: Array<{ id: string; name: string; parentId: string | null }>
  } | null
  if (!json?.success || !Array.isArray(json.data)) return []

  const rows = json.data
  const byId = new Map(rows.map((d) => [d.id, d]))

  return rows.map((d) => {
    let label = d.name
    if (d.parentId) {
      const parent = byId.get(d.parentId)
      if (parent) label = `${parent.name} — ${d.name}`
    }
    return { id: d.id, value: d.name, label }
  })
}
