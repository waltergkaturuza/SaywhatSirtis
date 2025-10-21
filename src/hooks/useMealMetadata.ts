import { useState, useEffect } from 'react'
import { collectFormMetadata, ClientMetadata } from '@/lib/meal-metadata-collector'

/**
 * React hook for collecting MEAL form metadata
 */
export function useMealMetadata(formVersion: string = '1.0') {
  const [metadata, setMetadata] = useState<ClientMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const collectMetadata = async () => {
      try {
        setLoading(true)
        const collectedMetadata = await collectFormMetadata(formVersion)
        setMetadata(collectedMetadata)
        setError(null)
      } catch (err) {
        console.error('Failed to collect metadata:', err)
        setError('Failed to collect device metadata')
        // Set fallback metadata
        setMetadata({
          screenResolution: 'Unknown',
          timezone: 'Unknown',
          language: 'Unknown',
          connectionType: 'Unknown',
          deviceInfo: {
            platform: 'Unknown',
            browser: 'Unknown',
            os: 'Unknown',
            isMobile: false,
            isTablet: false
          },
          formData: {
            completionTime: 0,
            formVersion,
            submissionSource: 'Web Form'
          }
        })
      } finally {
        setLoading(false)
      }
    }

    collectMetadata()
  }, [formVersion])

  return {
    metadata,
    loading,
    error,
    refresh: () => {
      setLoading(true)
      collectFormMetadata(formVersion)
        .then(setMetadata)
        .catch(setError)
        .finally(() => setLoading(false))
    }
  }
}

/**
 * Hook for form submission with automatic metadata collection
 */
export function useMealFormSubmission(formId: string, formVersion: string = '1.0') {
  const { metadata, loading, error } = useMealMetadata(formVersion)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const submitForm = async (formData: any) => {
    if (!metadata) {
      setSubmitError('Metadata not ready')
      return { success: false, error: 'Metadata not ready' }
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const submissionData = {
        ...formData,
        metadata: {
          ...metadata.formData,
          location: metadata.location,
          country: metadata.location ? 'Detected' : 'Unknown',
          region: metadata.location ? 'Detected' : 'Unknown',
          city: metadata.location ? 'Detected' : 'Unknown',
          timezone: metadata.timezone,
          screenResolution: metadata.screenResolution,
          connectionType: metadata.connectionType
        },
        deviceInfo: metadata.deviceInfo,
        latitude: metadata.location?.latitude,
        longitude: metadata.location?.longitude
      }

      const response = await fetch(`/api/meal/forms/${formId}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed')
      }

      return { success: true, data: result.data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Submission failed'
      setSubmitError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setSubmitting(false)
    }
  }

  return {
    metadata,
    loading: loading || submitting,
    error: error || submitError,
    submitForm,
    isReady: !loading && !error && !!metadata
  }
}
