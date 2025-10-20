"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

export default function PublicFormPage() {
  const params = useParams()
  const formId = params.id as string
  
  const [form, setForm] = useState<any>(null)
  const [data, setData] = useState<Record<string, any>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number, accuracy: number} | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (formId) {
      loadForm()
      loadSubmissionHistory()
    }
  }, [formId])

  // Auto-retry failed submissions when online
  useEffect(() => {
    const retryFailedSubmissions = async () => {
      const failedSubmissions = submissionHistory.filter(sub => sub.status === 'failed')
      for (const submission of failedSubmissions) {
        try {
          await retrySubmission(submission)
        } catch (error) {
          console.error('Auto-retry failed:', error)
        }
      }
    }

    // Check if we're online and have failed submissions
    if (navigator.onLine && submissionHistory.some(sub => sub.status === 'failed')) {
      retryFailedSubmissions()
    }

    // Listen for online event
    const handleOnline = () => {
      retryFailedSubmissions()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [submissionHistory])

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load submission history from localStorage
  const loadSubmissionHistory = () => {
    try {
      const history = localStorage.getItem(`form_submissions_${formId}`)
      if (history) {
        setSubmissionHistory(JSON.parse(history))
      }
    } catch (error) {
      console.error('Error loading submission history:', error)
    }
  }

  // Save submission to history
  const saveToHistory = (submission: any) => {
    try {
      const newHistory = [...submissionHistory, submission]
      setSubmissionHistory(newHistory)
      localStorage.setItem(`form_submissions_${formId}`, JSON.stringify(newHistory))
    } catch (error) {
      console.error('Error saving to history:', error)
    }
  }

  // Update submission status in history
  const updateSubmissionStatus = (id: string, status: string, error?: string) => {
    try {
      const updatedHistory = submissionHistory.map(sub => 
        sub.id === id ? { ...sub, status, error, updatedAt: new Date().toISOString() } : sub
      )
      setSubmissionHistory(updatedHistory)
      localStorage.setItem(`form_submissions_${formId}`, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Error updating submission status:', error)
    }
  }

  const loadForm = async () => {
    try {
      const res = await fetch(`/api/meal/forms/${formId}/public`)
      const result = await res.json()
      
      if (result.success) {
        setForm(result.data)
        // Auto-populate common fields
        autoPopulateCommonFields(result.data.schema)
      } else {
        setMessage('Form not found or not published')
      }
    } catch (error) {
      setMessage('Error loading form')
    }
  }

  // Auto-populate common fields when form loads
  const autoPopulateCommonFields = (schema: any) => {
    if (!schema?.fields) return
    
    const updates: Record<string, any> = {}
    const dateTime = getCurrentDateTime()
    
    schema.fields.forEach((field: any) => {
      const label = field.label?.toLowerCase() || ''
      const key = field.key?.toLowerCase() || ''
      
      // Auto-populate date/time fields
      if (label.includes('date') || label.includes('time') || label.includes('collection') || 
          key.includes('date') || key.includes('time')) {
        updates[field.key] = dateTime.datetime
      }
    })
    
    if (Object.keys(updates).length > 0) {
      setData(prev => ({ ...prev, ...updates }))
    }
  }

  // Smart Date/Time Auto-population
  const getCurrentDateTime = () => {
    const now = new Date()
    const gpsTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    return {
      date: gpsTime.toISOString().split('T')[0],
      time: gpsTime.toTimeString().split(' ')[0],
      datetime: gpsTime.toISOString(),
      timestamp: gpsTime.getTime()
    }
  }

  // Auto-populate date/time fields
  const autoPopulateDateTime = (fieldKey?: string) => {
    const dateTime = getCurrentDateTime()
    const updates: Record<string, any> = {
      'date_time_collection': dateTime.datetime,
      'collection_date': dateTime.date,
      'collection_time': dateTime.time,
      'timestamp': dateTime.timestamp.toString(),
      'date_time_of_collection': dateTime.datetime,
      'date_of_collection': dateTime.date,
      'time_of_collection': dateTime.time
    }
    
    // If specific field key provided, only update that field
    if (fieldKey) {
      setData(prev => ({ ...prev, [fieldKey]: dateTime.datetime }))
    } else {
      setData(prev => ({ ...prev, ...updates }))
      // Also auto-populate any date/time fields in the current schema
      if (form?.schema?.fields) {
        const dateTimeUpdates: Record<string, any> = {}
        form.schema.fields.forEach((field: any) => {
          const label = field.label?.toLowerCase() || ''
          const key = field.key?.toLowerCase() || ''
          if (label.includes('date') || label.includes('time') || label.includes('collection') || 
              key.includes('date') || key.includes('time')) {
            dateTimeUpdates[field.key] = dateTime.datetime
          }
        })
        if (Object.keys(dateTimeUpdates).length > 0) {
          setData(prev => ({ ...prev, ...dateTimeUpdates }))
        }
      }
    }
  }

  // Smart GPS Location Detection
  const getCurrentLocation = async (fieldKey?: string) => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser')
      return
    }

    setIsLoading(true)
    setGpsError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setGpsLocation({ lat: latitude, lng: longitude, accuracy })
        
        const gpsData = {
          'gps_latitude': latitude.toString(),
          'gps_longitude': longitude.toString(),
          'gps_accuracy': accuracy.toString(),
          'gps_coordinates': `${latitude}, ${longitude}`,
          'gps_location': `${latitude}, ${longitude}`,
          'gps_utm': convertToUTM(latitude, longitude)
        }
        
        // If specific field key provided, only update that field
        if (fieldKey) {
          setData(prev => ({ ...prev, [fieldKey]: `${latitude}, ${longitude}` }))
        } else {
          setData(prev => ({ ...prev, ...gpsData }))
          // Also auto-populate any GPS fields in the current schema
          if (form?.schema?.fields) {
            const gpsUpdates: Record<string, any> = {}
            form.schema.fields.forEach((field: any) => {
              const label = field.label?.toLowerCase() || ''
              const key = field.key?.toLowerCase() || ''
              if (label.includes('gps') || label.includes('location') || 
                  key.includes('gps') || key.includes('location')) {
                gpsUpdates[field.key] = `${latitude}, ${longitude}`
              }
            })
            if (Object.keys(gpsUpdates).length > 0) {
              setData(prev => ({ ...prev, ...gpsUpdates }))
            }
          }
        }
        
        setIsLoading(false)
      },
      (error) => {
        setGpsError(`GPS Error: ${error.message}`)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Convert GPS to UTM coordinates
  const convertToUTM = (lat: number, lng: number) => {
    // Simplified UTM conversion (Zone 35S for Zimbabwe)
    const zone = 35
    const easting = (lng + 180) * 111320 * Math.cos(lat * Math.PI / 180)
    const northing = lat * 110540
    return `Zone ${zone}S: ${easting.toFixed(2)}E, ${northing.toFixed(2)}N`
  }

  // Smart Camera Capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      setCameraStream(stream)
    } catch (error) {
      setGpsError(`Camera Error: ${error}`)
    }
  }

  const capturePhoto = () => {
    if (!cameraStream) return
    
    const video = document.createElement('video')
    video.srcObject = cameraStream
    video.play()
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(imageData)
      setData(prev => ({ ...prev, 'photo': imageData }))
      
      // Stop camera
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }

  // Smart Data Validation
  const validateField = (field: any, value: any) => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`
    }

    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (value && !emailRegex.test(value)) return 'Invalid email format'
        break
      case 'phone':
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
        if (value && !phoneRegex.test(value)) return 'Invalid phone number'
        break
      case 'number':
        if (value && isNaN(Number(value))) return 'Must be a valid number'
        if (value && Number(value) < 0) return 'Number must be positive'
        break
      case 'date':
        if (value && isNaN(Date.parse(value))) return 'Invalid date format'
        if (value) {
          const date = new Date(value)
          const now = new Date()
          if (date > now) return 'Date cannot be in the future'
        }
        break
      case 'photo':
        if (field.required && !value) return 'Photo is required'
        break
    }
    return null
  }

  // Enhanced error detection
  const getDetailedError = (error: string) => {
    if (error.includes('Network') || error.includes('fetch')) {
      return '🌐 Network Error: Check your internet connection and try again'
    }
    if (error.includes('timeout')) {
      return '⏰ Timeout: Server is taking too long to respond. Try again later'
    }
    if (error.includes('500') || error.includes('Internal Server Error')) {
      return '🔧 Server Error: There\'s a problem with our servers. Please try again later'
    }
    if (error.includes('404')) {
      return '❌ Form Not Found: This form may have been removed or unpublished'
    }
    if (error.includes('403') || error.includes('Forbidden')) {
      return '🚫 Access Denied: You don\'t have permission to submit this form'
    }
    if (error.includes('validation') || error.includes('required')) {
      return '📝 Validation Error: Please check all required fields are filled correctly'
    }
    return `❌ Error: ${error}`
  }

  const submit = async () => {
    setMessage(null)
    setIsLoading(true)

    // Validate all fields
    const errors: string[] = []
    form?.schema?.fields?.forEach((field: any) => {
      const error = validateField(field, data[field.key])
      if (error) errors.push(error)
    })

    if (errors.length > 0) {
      setMessage(`Validation errors: ${errors.join(', ')}`)
      setIsLoading(false)
      return
    }

    // Create submission record
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const submissionData = {
      id: submissionId,
      formId,
      data: {
        ...data,
        gps_location: gpsLocation,
        submission_timestamp: new Date().toISOString(),
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      attempts: 0
    }

    // Save to history immediately
    saveToHistory(submissionData)

    // Try to submit
    await attemptSubmission(submissionId, submissionData)
  }

  const attemptSubmission = async (submissionId: string, submissionData: any) => {
    try {
      const r = await fetch(`/api/meal/forms/${formId}/submissions/public`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ data: submissionData.data }) 
      })
      
      const j = await r.json()
      
      if (j.success) {
        updateSubmissionStatus(submissionId, 'success')
        setMessage('Form submitted successfully! Thank you for your submission.')
        
        // Clear form after successful submission
        setData({})
        setCapturedImage(null)
        setGpsLocation(null)
      } else {
        const detailedError = getDetailedError(j.error || 'Server error')
        updateSubmissionStatus(submissionId, 'failed', detailedError)
        setMessage(detailedError)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      const detailedError = getDetailedError(errorMessage)
      updateSubmissionStatus(submissionId, 'failed', detailedError)
      setMessage(detailedError)
    } finally {
      setIsLoading(false)
    }
  }

  const retrySubmission = async (submission: any) => {
    setIsLoading(true)
    setMessage('Retrying submission...')
    
    try {
      const r = await fetch(`/api/meal/forms/${formId}/submissions/public`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ data: submission.data }) 
      })
      
      const j = await r.json()
      
      if (j.success) {
        updateSubmissionStatus(submission.id, 'success')
        setMessage('Submission retried successfully!')
      } else {
        const detailedError = getDetailedError(j.error || 'Server error')
        updateSubmissionStatus(submission.id, 'failed', detailedError)
        setMessage(`Retry failed: ${detailedError}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      const detailedError = getDetailedError(errorMessage)
      updateSubmissionStatus(submission.id, 'failed', detailedError)
      setMessage(`Retry failed: ${detailedError}`)
    } finally {
      setIsLoading(false)
    }
  }

  const renderField = (f: any) => {
    const common = { 
      className: `px-3 py-2 border rounded-md w-full ${validateField(f, data[f.key]) ? 'border-red-500' : 'border-gray-300'}`, 
      value: data[f.key] || '', 
      onChange: (e: any) => setData(prev => ({ ...prev, [f.key]: e.target.value }))
    }

    // Smart field detection and auto-population
    const isDateTimeField = f.label?.toLowerCase().includes('date') || f.label?.toLowerCase().includes('time') || f.label?.toLowerCase().includes('collection') || f.key?.toLowerCase().includes('date') || f.key?.toLowerCase().includes('time')
    const isGpsField = f.label?.toLowerCase().includes('gps') || f.label?.toLowerCase().includes('location') || f.key?.toLowerCase().includes('gps') || f.key?.toLowerCase().includes('location')
    const isPhotoField = f.type === 'photo' || f.label?.toLowerCase().includes('photo') || f.label?.toLowerCase().includes('picture')

    switch(f.type) {
      case 'number': 
        return (
          <div className="space-y-1">
            <input type="number" {...common} />
            {validateField(f, data[f.key]) && <div className="text-red-500 text-xs">{validateField(f, data[f.key])}</div>}
          </div>
        )
      case 'date': 
        return (
          <div className="space-y-1">
            <input type="date" {...common} />
            {isDateTimeField && (
              <button 
                type="button"
                onClick={() => autoPopulateDateTime(f.key)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                📅 Use current date/time
              </button>
            )}
            {validateField(f, data[f.key]) && <div className="text-red-500 text-xs">{validateField(f, data[f.key])}</div>}
          </div>
        )
      case 'select': 
        return (
          <div className="space-y-1">
            <select {...common as any}>
              <option value="">Select {f.label}</option>
              {(f.options || []).map((o: string) => (<option key={o} value={o}>{o}</option>))}
            </select>
            {validateField(f, data[f.key]) && <div className="text-red-500 text-xs">{validateField(f, data[f.key])}</div>}
          </div>
        )
      case 'photo':
        return (
          <div className="space-y-2">
            {capturedImage ? (
              <div className="space-y-2">
                <img src={capturedImage} alt="Captured" className="w-full h-48 object-cover rounded-md border" />
                <button 
                  type="button"
                  onClick={() => { setCapturedImage(null); setData(prev => ({ ...prev, [f.key]: '' })) }}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  🗑️ Remove photo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button 
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm"
                >
                  📷 Take Photo
                </button>
                {cameraStream && (
                  <div className="space-y-2">
                    <video 
                      autoPlay 
                      playsInline 
                      className="w-full h-48 object-cover rounded-md border"
                      ref={(video) => {
                        if (video && cameraStream) video.srcObject = cameraStream
                      }}
                    />
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={capturePhoto}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                      >
                        📸 Capture
                      </button>
                      <button 
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {validateField(f, data[f.key]) && <div className="text-red-500 text-xs">{validateField(f, data[f.key])}</div>}
          </div>
        )
      default: 
        return (
          <div className="space-y-1">
            <input type="text" {...common} />
            {isDateTimeField && (
              <button 
                type="button"
                onClick={() => autoPopulateDateTime(f.key)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                📅 Use current date/time
              </button>
            )}
            {isGpsField && (
              <button 
                type="button"
                onClick={() => getCurrentLocation(f.key)}
                disabled={isLoading}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {isLoading ? '🔄 Getting location...' : '📍 Get GPS location'}
              </button>
            )}
            {validateField(f, data[f.key]) && <div className="text-red-500 text-xs">{validateField(f, data[f.key])}</div>}
          </div>
        )
    }
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Loading form...</div>
          {message && <div className="text-red-600">{message}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.name}</h1>
              {form.description && (
                <p className="text-gray-600">{form.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </div>
            </div>
          </div>
        </div>

        {/* Submission History */}
        {submissionHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">📋 Submission History</h3>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
              >
                {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>
            
            {showHistory && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {submissionHistory.map((submission, index) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          submission.status === 'success' ? 'bg-green-100 text-green-800' :
                          submission.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status === 'success' ? '✅ Success' :
                           submission.status === 'failed' ? '❌ Failed' :
                           '⏳ Pending'}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(submission.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {submission.error && (
                        <div className="text-xs text-red-600 mt-1">
                          Error: {submission.error}
                        </div>
                      )}
                    </div>
                    {submission.status === 'failed' && (
                      <button 
                        onClick={() => retrySubmission(submission)}
                        disabled={isLoading}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                      >
                        🔄 Retry
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">🧠 Smart Form Features</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => getCurrentLocation()}
              disabled={isLoading}
              className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
            >
              📍 Get GPS Location
            </button>
            <button 
              onClick={() => autoPopulateDateTime()}
              className="px-3 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
            >
              🕐 Auto Date/Time
            </button>
            <button 
              onClick={() => startCamera()}
              className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
            >
              📷 Open Camera
            </button>
            <button 
              onClick={() => {
                autoPopulateDateTime()
                if (gpsLocation) {
                  // Re-populate GPS fields
                  const gpsUpdates: Record<string, any> = {}
                  form?.schema?.fields?.forEach((field: any) => {
                    const label = field.label?.toLowerCase() || ''
                    const key = field.key?.toLowerCase() || ''
                    if (label.includes('gps') || label.includes('location') || 
                        key.includes('gps') || key.includes('location')) {
                      gpsUpdates[field.key] = `${gpsLocation.lat}, ${gpsLocation.lng}`
                    }
                  })
                  if (Object.keys(gpsUpdates).length > 0) {
                    setData(prev => ({ ...prev, ...gpsUpdates }))
                  }
                }
              }}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              🧠 Fill All Smart Fields
            </button>
          </div>
          
          {gpsLocation && (
            <div className="text-sm text-green-700 bg-green-50 p-2 rounded mt-3">
              ✅ GPS: {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)} (Accuracy: {gpsLocation.accuracy.toFixed(0)}m)
            </div>
          )}
          
          {gpsError && (
            <div className="text-sm text-red-700 bg-red-50 p-2 rounded mt-3">
              ❌ {gpsError}
            </div>
          )}
        </div>

        {/* Form Fields */}
        {form.schema?.fields && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Form Fields</h3>
            <div className="space-y-4">
              {form.schema.fields.map((f: any) => (
                <div key={f.key} className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    {f.label}
                    {f.required && <span className="text-red-600 ml-1">*</span>}
                  </div>
                  {renderField(f)}
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <button 
                  onClick={submit} 
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 font-medium"
                >
                  {isLoading ? '🔄 Submitting...' : '✅ Submit Form'}
                </button>
              </div>
              
              {message && (
                <div className={`text-sm p-3 rounded-md ${
                  message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
