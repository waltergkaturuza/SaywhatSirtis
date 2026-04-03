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
 * Project list / dashboard % aligned with Project Indicators cumulative column
 * (`getCumulativeProgressPercentage`): for each measurable indicator,
 * cumulative attainment ratio = min(current / target, 1), then
 * project % = (mean of those ratios) × 100.
 */
export function projectIndicatorProgressAggregate(rows: IndicatorProgressRow[]): {
  percent: number
  hasData: boolean
  measuredCount: number
} {
  const ratios: number[] = []
  for (const row of rows) {
    const t = row.target
    if (t == null || t <= 0) continue
    const c = row.current ?? 0
    ratios.push(Math.min(c / t, 1))
  }
  if (ratios.length === 0) return { percent: 0, hasData: false, measuredCount: 0 }
  const meanRatio =
    ratios.reduce((a, b) => a + b, 0) / ratios.length
  const percent = meanRatio * 100
  return {
    percent: Math.round(percent),
    hasData: true,
    measuredCount: ratios.length,
  }
}

export function buildProjectIdToIndicatorProgress(
  indicators: { projectId: string | null; current: number | null; target: number | null }[]
): Map<string, { percent: number; hasData: boolean; measuredCount: number }> {
  const byProject = new Map<string, IndicatorProgressRow[]>()
  for (const ind of indicators) {
    if (!ind.projectId) continue
    const list = byProject.get(ind.projectId) ?? []
    list.push({ current: ind.current, target: ind.target })
    byProject.set(ind.projectId, list)
  }
  const out = new Map<string, { percent: number; hasData: boolean; measuredCount: number }>()
  for (const [projectId, rows] of byProject) {
    out.set(projectId, projectIndicatorProgressAggregate(rows))
  }
  return out
}
