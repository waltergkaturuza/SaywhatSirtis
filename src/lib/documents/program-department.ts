/** True when the HR/employee department should see Programs project linking (upload, etc.). */
export function isProgramsDepartmentName(name: string | undefined | null): boolean {
  const n = (name || "").trim().toLowerCase()
  if (!n) return false
  return n.includes("program")
}
