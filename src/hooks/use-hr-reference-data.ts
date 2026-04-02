"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

export interface HrDepartmentOption {
  id: string
  name: string
  parentId?: string | null
}

const fetchOpts: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
}

/**
 * Same HR loading behavior as Asset Registration: hierarchy departments + employees list.
 * Waits for `authenticated` session before fetching (avoids empty dropdowns from early calls).
 */
export function useHrReferenceData(enabled = true) {
  const { status } = useSession()
  const [departments, setDepartments] = useState<HrDepartmentOption[]>([])
  const [employees, setEmployees] = useState<
    { id: string; firstName?: string; lastName?: string; email?: string }[]
  >([])
  const [loadingData, setLoadingData] = useState(true)
  const [referenceDataError, setReferenceDataError] = useState<string | null>(null)

  const loadHrData = useCallback(async () => {
    setLoadingData(true)
    setReferenceDataError(null)
    try {
      let deptRows: HrDepartmentOption[] = []

      const deptResponse = await fetch("/api/hr/departments/hierarchy", fetchOpts)
      if (deptResponse.ok) {
        const deptData = await deptResponse.json()
        if (deptData.success && deptData.data && deptData.data.flat) {
          deptRows = deptData.data.flat.map((dept: HrDepartmentOption & { parentId?: string | null }) => ({
            id: dept.id,
            name: dept.name,
            parentId: dept.parentId || null,
          }))
        } else {
          console.error("Unexpected department data structure:", deptData)
        }
      } else {
        console.error("Failed to fetch departments:", deptResponse.status)
      }

      if (deptRows.length === 0) {
        const listRes = await fetch("/api/hr/department/list", fetchOpts)
        if (listRes.ok) {
          const listJson = await listRes.json()
          if (listJson.success && Array.isArray(listJson.data)) {
            deptRows = listJson.data.map(
              (d: { id: string; name: string; parentId?: string | null }) => ({
                id: d.id,
                name: d.name,
                parentId: d.parentId ?? null,
              })
            )
          }
        }
      }
      setDepartments(deptRows)

      const empResponse = await fetch("/api/hr/employees", fetchOpts)
      if (empResponse.ok) {
        const empData = await empResponse.json()
        if (empData.success && empData.data) {
          setEmployees(empData.data)
        } else if (Array.isArray(empData)) {
          setEmployees(empData)
        } else {
          console.error("Unexpected employee data structure:", empData)
          setEmployees([])
        }
      } else {
        console.error("Failed to fetch employees:", empResponse.status)
        setEmployees([])
      }

      const msgs: string[] = []
      if (deptRows.length === 0) {
        msgs.push(
          deptResponse.status === 401
            ? "Sign in again to load departments."
            : "No departments returned (check HR data or API errors)."
        )
      }
      if (!empResponse.ok) {
        msgs.push(
          empResponse.status === 401
            ? "Sign in again to load employees."
            : `Employees API error (${empResponse.status}).`
        )
      }
      setReferenceDataError(msgs.length ? msgs.join(" ") : null)
    } catch (e) {
      console.error("Error fetching HR data:", e)
      setReferenceDataError(
        "Could not load departments or employees. Check your connection and try again."
      )
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoadingData(false)
      return
    }
    if (status === "loading") {
      return
    }
    if (status !== "authenticated") {
      setLoadingData(false)
      setDepartments([])
      setEmployees([])
      if (status === "unauthenticated") {
        setReferenceDataError("Sign in to load departments and employees.")
      }
      return
    }
    void loadHrData()
  }, [enabled, status, loadHrData])

  return {
    departments,
    employees,
    loadingData,
    referenceDataError,
    refetch: loadHrData,
  }
}
