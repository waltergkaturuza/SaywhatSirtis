import { Prisma } from "@prisma/client"
import type { PrismaClient } from "@prisma/client"

export type MealIndicatorProgressRow = {
  projectId: string | null
  current: number | null
  target: number | null
}

/**
 * Loads indicator rows for progress aggregation. If the DB predates the
 * `projectId` column (P2022), returns [] so APIs can fall back to `projects.progress`.
 */
export async function fetchMealIndicatorsForProjectProgress(
  prisma: PrismaClient,
  projectIds: string[]
): Promise<MealIndicatorProgressRow[]> {
  if (projectIds.length === 0) return []
  try {
    return await prisma.meal_indicators.findMany({
      where: { projectId: { in: projectIds } },
      select: { projectId: true, current: true, target: true },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2022") {
      console.warn(
        "[meal_indicators] Column mismatch (e.g. missing projectId). Run prisma migrations. Using project.progress fallback."
      )
      return []
    }
    throw e
  }
}
