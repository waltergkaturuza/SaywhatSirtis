'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Pencil, Calendar, User, FileText, AlertTriangle } from 'lucide-react'
import type { RiskCategory, RiskImpact, RiskProbability, RiskStatus } from '@prisma/client'

type AssessmentDetail = {
  id: string
  riskId: string
  riskInternalId: string
  assessorId: string
  assessmentDate: string
  previousProbability: RiskProbability | null
  previousImpact: RiskImpact | null
  probability: RiskProbability
  impact: RiskImpact
  riskScore: number
  findings: string
  recommendations: string
  nextAssessmentDate: string | null
  status: string
  assessor: {
    firstName: string | null
    lastName: string | null
    email: string
  }
  risk: {
    id: string
    riskId: string
    title: string
    category: RiskCategory
    status: RiskStatus
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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

export default function RiskAssessmentViewPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/risk-management/assessments/${id}`, { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error || 'Failed to load assessment')
          setAssessment(null)
          return
        }
        setAssessment(data.data?.assessment ?? null)
      } catch {
        setError('Failed to load assessment')
        setAssessment(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const getRiskScoreColor = (score: number) => {
    if (score <= 5) return 'bg-green-100 text-green-800'
    if (score <= 10) return 'bg-yellow-100 text-yellow-800'
    if (score <= 15) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30 flex items-center justify-center">
        <div className="animate-pulse text-orange-600 font-semibold">Loading assessment…</div>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30 px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          <AlertTriangle className="h-14 w-14 text-orange-500 mx-auto mb-4" />
          <p className="text-orange-900 font-semibold mb-4">{error || 'Assessment not found'}</p>
          <Link
            href="/risk-management/assessment"
            className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to assessments
          </Link>
        </div>
      </div>
    )
  }

  const assessorName =
    [assessment.assessor.firstName, assessment.assessor.lastName].filter(Boolean).join(' ') || '—'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Link
            href="/risk-management/assessment"
            className="inline-flex items-center px-4 py-2 text-orange-700 hover:text-orange-900 bg-white/70 backdrop-blur-sm rounded-xl border border-orange-200/50 hover:bg-orange-50/80 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to assessments
          </Link>
          <Link
            href={`/risk-management/risks/${assessment.risk.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-800 bg-orange-100/80 rounded-xl border border-orange-200 hover:bg-orange-100"
          >
            View risk record
          </Link>
          {canModify(session) && (
            <Link
              href={`/risk-management/assessment/${id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-md ml-auto"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-orange-100 text-sm font-medium">{assessment.risk.riskId}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">{assessment.risk.title}</h1>
                <p className="text-orange-100 mt-2">
                  Category: {String(assessment.risk.category).replace('_', ' ')} · Risk status:{' '}
                  {assessment.risk.status}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getRiskScoreColor(assessment.riskScore)}`}
              >
                Score {assessment.riskScore}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <Calendar className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-orange-800 uppercase tracking-wide">Assessment date</p>
                  <p className="text-orange-900 font-semibold">{formatDate(assessment.assessmentDate)}</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <User className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-orange-800 uppercase tracking-wide">Assessor</p>
                  <p className="text-orange-900 font-semibold">{assessorName}</p>
                  <p className="text-sm text-orange-700">{assessment.assessor.email || '—'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-orange-100">
                <p className="text-xs font-bold text-orange-800 uppercase mb-2">Probability (at assessment)</p>
                <p className="text-orange-900 font-semibold">{assessment.probability}</p>
                {assessment.previousProbability != null && (
                  <p className="text-sm text-orange-600 mt-1">
                    Previously: {assessment.previousProbability}
                  </p>
                )}
              </div>
              <div className="p-4 rounded-xl border border-orange-100">
                <p className="text-xs font-bold text-orange-800 uppercase mb-2">Impact (at assessment)</p>
                <p className="text-orange-900 font-semibold">{assessment.impact}</p>
                {assessment.previousImpact != null && (
                  <p className="text-sm text-orange-600 mt-1">Previously: {assessment.previousImpact}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-bold text-orange-900">Findings</h2>
              </div>
              <p className="text-orange-800 whitespace-pre-wrap leading-relaxed bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                {assessment.findings || '—'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-orange-900 mb-3">Recommendations</h2>
              <p className="text-orange-800 whitespace-pre-wrap leading-relaxed bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                {assessment.recommendations || '—'}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 items-center">
              <div>
                <p className="text-xs font-bold text-orange-800 uppercase mb-1">Status</p>
                <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800">
                  {assessment.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-orange-800 uppercase mb-1">Next assessment</p>
                <p className="text-orange-900 font-semibold">
                  {assessment.nextAssessmentDate ? formatDate(assessment.nextAssessmentDate) : 'Not scheduled'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
