/**
 * Departments / subunits that must link uploads to a real `projects` row
 * (same UX as the former "Programs-only" rule).
 *
 * Matches:
 * - Programs main unit and any subunit whose label contains "program" (e.g. "Programs → WASH")
 * - Grants and Compliance (and similar names containing grant + compliance)
 * - MEAL / M&E / Monitoring & Evaluation style names
 */
export function departmentRequiresProgramProjectLink(
  name: string | undefined | null
): boolean {
  const n = (name || "").trim().toLowerCase();
  if (!n) return false;

  if (isProgramsFamilyDepartment(n)) return true;
  if (isGrantsComplianceDepartment(n)) return true;
  if (isMealDepartment(n)) return true;

  return false;
}

function isProgramsFamilyDepartment(n: string): boolean {
  if (n.includes("program")) return true;
  if (n.includes("programme")) return true;
  return false;
}

function isGrantsComplianceDepartment(n: string): boolean {
  if (n.includes("grants and compliance")) return true;
  if (n.includes("grant") && n.includes("compliance")) return true;
  return false;
}

function isMealDepartment(n: string): boolean {
  if (n.includes("meal")) return true;
  if (n.includes("m&e") || n.includes("m & e")) return true;
  if (n.includes("monitoring") && n.includes("evaluation")) return true;
  return false;
}

/** @deprecated Prefer {@link departmentRequiresProgramProjectLink} */
export const isProgramsDepartmentName = departmentRequiresProgramProjectLink;
