/**
 * Aligns with project-indicators UI: min((current/target)*100, 100).
 * Returns null when target is missing or non-positive (no measurable progress).
 */
export function indicatorRowProgressPercent(
  current: number | null | undefined,
  target: number | null | undefined
): number | null {
  if (target == null || target <= 0) return null
  const c = current ?? 0
  return Math.min((c / target) * 100, 100)
}

export type IndicatorProgressRow = {
  current: number | null | undefined
  target: number | null | undefined
}

/**
 * Average progress across indicators that have a valid target.
 * If none qualify, returns { percent: 0, hasData: false }.
 */
export function projectIndicatorProgressAggregate(rows: IndicatorProgressRow[]): {
  percent: number
  hasData: boolean
} {
  const pcts: number[] = []
  for (const row of rows) {
    const p = indicatorRowProgressPercent(row.current, row.target)
    if (p !== null) pcts.push(p)
  }
  if (pcts.length === 0) return { percent: 0, hasData: false }
  const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length
  return { percent: Math.round(avg), hasData: true }
}

export function buildProjectIdToIndicatorProgress(
  indicators: { projectId: string | null; current: number | null; target: number | null }[]
): Map<string, { percent: number; hasData: boolean }> {
  const byProject = new Map<string, IndicatorProgressRow[]>()
  for (const ind of indicators) {
    if (!ind.projectId) continue
    const list = byProject.get(ind.projectId) ?? []
    list.push({ current: ind.current, target: ind.target })
    byProject.set(ind.projectId, list)
  }
  const out = new Map<string, { percent: number; hasData: boolean }>()
  for (const [projectId, rows] of byProject) {
    out.set(projectId, projectIndicatorProgressAggregate(rows))
  }
  return out
}
