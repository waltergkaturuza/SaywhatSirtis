/**
 * Project health and dashboard performance — aligned with MEAL indicator progress
 * (current vs target). Zero attainment when indicators exist is "not performing", not healthy.
 */

export type ProjectHealth = "healthy" | "at-risk" | "critical"

export type ProjectHealthInput = {
  status: string
  /** 0–100; should be indicator-based % when MEAL data exists (see projects API). */
  progress: number
  /** True when project has at least one MEAL indicator with a positive target. */
  hasIndicatorData: boolean
  budget?: number | null
  actualSpent?: number | null
  endDate?: Date | string | null
  now?: Date
}

export function computeProjectHealth(input: ProjectHealthInput): ProjectHealth {
  const now = input.now ?? new Date()
  const st = (input.status || "").toUpperCase()
  const progress =
    typeof input.progress === "number" && !Number.isNaN(input.progress)
      ? input.progress
      : 0
  const budget = input.budget ?? 0
  const spent = input.actualSpent ?? 0
  const budgetUtil = budget > 0 ? (spent / budget) * 100 : 0

  const end = input.endDate ? new Date(input.endDate) : null
  const overdue =
    !!(
      end &&
      end < now &&
      st !== "COMPLETED" &&
      st !== "CANCELLED" &&
      st !== "DRAFT"
    )

  if (st === "CANCELLED") return "critical"
  if (st === "ON_HOLD") return "critical"
  if (st === "DRAFT") return "at-risk"
  if (budgetUtil > 90) return "critical"

  // MEAL indicators vs target: no progress means not performing
  if (input.hasIndicatorData) {
    if (progress <= 0) return overdue ? "critical" : "critical"
    if (progress < 35) return overdue ? "critical" : "at-risk"
    if (progress < 60 && (overdue || budgetUtil > 65)) return "at-risk"
    if (progress < 60) return "at-risk"
  } else {
    // No measurable indicators — do not show as healthy at 0%
    if (progress <= 0 && (st === "ACTIVE" || st === "PLANNING")) {
      return overdue ? "critical" : "at-risk"
    }
  }

  if (overdue && progress < 70) return "critical"
  if (progress < 50 && budgetUtil > 65) return "at-risk"
  if (progress < 30 && budgetUtil > 40) return "at-risk"

  return "healthy"
}

/**
 * Dashboard KPI: average indicator attainment across ACTIVE projects.
 * Projects without MEAL targets count as 0% toward the average (not performing until measured).
 */
export function computeDashboardProgramPerformance(
  activeProjects: { id: string }[],
  indicatorByProject: Map<string, { percent: number; hasData: boolean }>
): number {
  if (activeProjects.length === 0) return 0
  let sum = 0
  for (const p of activeProjects) {
    const agg = indicatorByProject.get(p.id)
    const pct = agg?.hasData ? agg.percent : 0
    sum += pct
  }
  return Math.round((sum / activeProjects.length) * 10) / 10
}
