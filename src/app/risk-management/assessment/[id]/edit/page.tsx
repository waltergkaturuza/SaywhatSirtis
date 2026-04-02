'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Save } from 'lucide-react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import type { RiskProbability, RiskImpact } from '@prisma/client'

const riskProbabilities = [
  { value: 'VERY_LOW', label: 'Very Low' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'VERY_HIGH', label: 'Very High' },
]

const riskImpacts = [
  { value: 'VERY_LOW', label: 'Very Low' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'VERY_HIGH', label: 'Very High' },
]

/** Map DB enum to closest 5-level form value for select */
function probImpactToFormValue(v: RiskProbability | RiskImpact): string {
  const u = String(v).toUpperCase()
  if (u === 'LOW') return 'LOW'
  if (u === 'HIGH') return 'HIGH'
  return 'MEDIUM'
}

function canModify(session: ReturnType<typeof useSession>['data']) {
  const userPermissions = session?.user?.permissions || []
  const userRoles = session?.user?.roles || []
  return (
    userPermissions.includes('risk.create') ||
    userPermissions.includes('admin.access') ||
    userPermissions.includes('risks_edit') ||
    userPermissions.includes('risks.edit') ||
    userPermissions.includes('risk.edit') ||
    userRoles.some((role) =>
      ['hr', 'advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role.toLowerCase())
    )
  )
}

export default function RiskAssessmentEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: session, status } = useSession()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [riskLabel, setRiskLabel] = useState('')
  const [formData, setFormData] = useState({
    probability: 'MEDIUM' as string,
    impact: 'MEDIUM' as string,
    findings: '',
    recommendations: '',
    nextAssessmentDate: '',
    status: 'COMPLETED',
  })

  useEffect(() => {
    if (!id || status === 'loading') return
    if (session && !canModify(session)) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/risk-management/assessments/${id}`, { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error || 'Failed to load assessment')
          return
        }
        const a = data.data?.assessment
        if (!a) {
          setError('Assessment not found')
          return
        }
        setRiskLabel(`${a.risk.riskId} — ${a.risk.title}`)
        setFormData({
          probability: probImpactToFormValue(a.probability),
          impact: probImpactToFormValue(a.impact),
          findings: a.findings || '',
          recommendations: a.recommendations || '',
          nextAssessmentDate: a.nextAssessmentDate ? a.nextAssessmentDate.slice(0, 10) : '',
          status: a.status || 'COMPLETED',
        })
      } catch {
        setError('Failed to load assessment')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, session, status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30 flex items-center justify-center">
        <div className="animate-pulse text-orange-600 font-semibold">Loading…</div>
      </div>
    )
  }

  if (session && !canModify(session)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-50/30">
        <div className="text-center px-4">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access denied</h3>
          <p className="mt-1 text-sm text-gray-500">You cannot edit risk assessments.</p>
          <Link
            href={`/risk-management/assessment/${id}`}
            className="mt-6 inline-block text-orange-600 hover:text-orange-800 font-medium"
          >
            View assessment
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.findings.trim() || !formData.recommendations.trim()) {
      alert('Findings and recommendations are required')
      return
    }
    try {
      setSaving(true)
      const res = await fetch(`/api/risk-management/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          probability: formData.probability,
          impact: formData.impact,
          findings: formData.findings,
          recommendations: formData.recommendations,
          nextAssessmentDate: formData.nextAssessmentDate || null,
          status: formData.status,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(payload.error || 'Failed to save')
        return
      }
      router.push(`/risk-management/assessment/${id}`)
      router.refresh()
    } catch {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-orange-50/30 px-4 py-12 text-center">
        <p className="text-red-700 font-medium mb-4">{error}</p>
        <Link href="/risk-management/assessment" className="text-orange-600 hover:underline">
          Back to assessments
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/risk-management/assessment/${id}`}
            className="inline-flex items-center px-4 py-2 text-orange-700 hover:text-orange-900 bg-white/70 rounded-xl border border-orange-200/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </div>

        <div className="bg-white/95 rounded-2xl shadow-2xl border border-orange-200/50 p-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
            Edit risk assessment
          </h1>
          <p className="text-orange-800/80 mb-8 font-medium">{riskLabel}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-orange-800 mb-2">Probability *</label>
                <select
                  value={formData.probability}
                  onChange={(e) => setFormData((p) => ({ ...p, probability: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white"
                  required
                >
                  {riskProbabilities.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-orange-800 mb-2">Impact *</label>
                <select
                  value={formData.impact}
                  onChange={(e) => setFormData((p) => ({ ...p, impact: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white"
                  required
                >
                  {riskImpacts.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-orange-800 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="COMPLETED">Completed</option>
                <option value="UNDER_REVIEW">Under review</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-orange-800 mb-2">Findings *</label>
              <textarea
                value={formData.findings}
                onChange={(e) => setFormData((p) => ({ ...p, findings: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-orange-800 mb-2">Recommendations *</label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData((p) => ({ ...p, recommendations: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-orange-800 mb-2">Next assessment date</label>
              <input
                type="date"
                value={formData.nextAssessmentDate}
                onChange={(e) => setFormData((p) => ({ ...p, nextAssessmentDate: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-60"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <Link
                href={`/risk-management/assessment/${id}`}
                className="px-8 py-3 border-2 border-orange-300 text-orange-700 rounded-xl font-semibold hover:bg-orange-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
