"use client"

import { useState, useEffect } from "react"

export default function MealModule() {
  const tabs: { id: TabId; label: string }[] = [
    { id: "forms", label: "Forms" },
    { id: "submissions", label: "Submissions" },
    { id: "indicators", label: "Indicators" },
    { id: "dashboards", label: "Dashboards" },
    { id: "repository", label: "Data Repository" },
    { id: "feedback", label: "Accountability" },
    { id: "settings", label: "Settings" }
  ]

  const [active, setActive] = useState<TabId>("forms")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">MEAL Module</h2>
        <p className="text-gray-600">Monitoring, Evaluation, Accountability and Learning</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${active === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-green-300 hover:text-green-600'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border p-6 min-h-[360px]">
        {active === "forms" && <FormsStub />}
        {active === "submissions" && <SubmissionsStub />}
        {active === "indicators" && <IndicatorsStub />}
        {active === "dashboards" && <DashboardsStub />}
        {active === "repository" && <RepositoryStub />}
        {active === "feedback" && <FeedbackStub />}
        {active === "settings" && <SettingsStub />}
      </div>
    </div>
  )
}

type TabId = "forms" | "submissions" | "indicators" | "dashboards" | "repository" | "feedback" | "settings"

function StubBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        {items.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
      <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
        This is a scaffold. We’ll wire APIs, storage and charts next.
      </div>
    </div>
  )
}

function FormsStub() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forms, setForms] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState("")
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [fieldType, setFieldType] = useState<'text'|'shorttext'|'longtext'|'number'|'decimal'|'currency'|'date'|'time'|'datetime'|'select'|'radio'|'checkbox'|'gps'|'file'|'photo'|'video'>('text')
  const [fieldLabel, setFieldLabel] = useState("")
  const [fieldKey, setFieldKey] = useState("")
  const [fieldRequired, setFieldRequired] = useState(false)
  const [fieldOptions, setFieldOptions] = useState("")
  const [fieldMultiple, setFieldMultiple] = useState(false)

  useEffect(() => {
    load()
    loadProjects()
  }, [])

  // Add keyboard shortcut to close form with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selected) {
        setSelected(null)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selected])

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/programs/projects')
      const j = await res.json()
      if (j.success) setProjects(j.data || [])
    } catch (e: any) {
      console.error('Failed to load projects:', e.message)
    }
  }

  const load = async () => {
    try {
      setLoading(true); setError(null)
      const res = await fetch('/api/meal/forms')
      const j = await res.json()
      if (!j.success) throw new Error(j.error || 'Failed to fetch')
      console.log("Forms data received:", j.data)
      setForms(j.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const create = async () => {
    try {
      setCreating(true); setError(null)
      const res = await fetch('/api/meal/forms', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          name, 
          description,
          project_id: selectedProjects.length > 0 ? selectedProjects[0] : null,
          projectIds: selectedProjects,
          schema: { fields: [] } 
        })
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.error || 'Failed to create')
      setName(""); setDescription(""); setSelectedProjects([]); await load()
    } catch (e: any) { setError(e.message) } finally { setCreating(false) }
  }

  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const saveSelected = async () => {
    if (!selected) return
    try {
      setError(null)
      const res = await fetch(`/api/meal/forms/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: selected.name, description: selected.description, language: selected.language, status: selected.status, schema: selected.schema })})
      const j = await res.json()
      if (!j.success) throw new Error(j.error || 'Failed to save')
      setSaveMsg('Saved')
      await load()
      // Close the form after saving
      setTimeout(() => {
        setSelected(null)
        setSaveMsg(null)
      }, 1000) // Close after 1 second to show "Saved" message
    } catch (e: any) { setError(e.message) }
  }

  const addField = () => {
    if (!selected) return
    const opts = (fieldType==='select'||fieldType==='radio'||fieldType==='checkbox') ? fieldOptions.split(',').map(s=>s.trim()).filter(Boolean) : undefined
    const accept = fieldType==='photo' ? 'image/*' : fieldType==='video' ? 'video/*' : fieldType==='file' ? '*/*' : undefined
    const f:any = { key: fieldKey || fieldLabel.toLowerCase().replace(/\s+/g,'_'), type: fieldType, label: fieldLabel, required: fieldRequired }
    if (opts) f.options = opts
    if (accept) f.accept = accept
    if (['file','photo','video'].includes(fieldType)) f.multiple = fieldMultiple
    const next = { ...selected }
    next.schema = next.schema || { fields: [] }
    next.schema.fields = Array.isArray(next.schema.fields) ? next.schema.fields.concat([f]) : [f]
    setSelected(next)
    setFieldLabel(""); setFieldKey(""); setFieldRequired(false); setFieldOptions(""); setFieldMultiple(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Dynamic Form Builder</h3>
        <button onClick={load} className="px-3 py-2 border rounded-md">Refresh</button>
      </div>
      {error && <div className="p-3 border border-red-200 bg-red-50 text-red-700 text-sm rounded">{error}</div>}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Form name" className="px-3 py-2 border rounded-md w-64" />
          <button onClick={create} disabled={!name || creating} className="px-3 py-2 bg-orange-600 text-white rounded-md disabled:opacity-50">Create</button>
        </div>
        <div className="flex items-center gap-2">
          <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (optional)" className="px-3 py-2 border rounded-md w-64" />
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Projects:</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2">
              {projects.map(p => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={selectedProjects.includes(p.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedProjects(prev => [...prev, p.id])
                      } else {
                        setSelectedProjects(prev => prev.filter(id => id !== p.id))
                      }
                    }}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2">
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Project</th>
                    <th className="py-2 pr-4">Created By</th>
                    <th className="py-2 pr-4">Last Updated By</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Form Link</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {forms.map(f => (
                    <tr key={f.id}>
                      <td className="py-2 pr-4">{f.name}</td>
                      <td className="py-2 pr-4">
                        {f.assignedProjects && f.assignedProjects.length > 0 ? (
                          <div className="text-xs">
                            {f.assignedProjects.filter(Boolean).join(', ')}
                          </div>
                        ) : (
                          f.projectName || '-'
                        )}
                      </td>
                      <td className="py-2 pr-4">{f.createdByFirstName && f.createdByLastName ? `${f.createdByFirstName} ${f.createdByLastName}` : (f.createdBy || '-')}</td>
                      <td className="py-2 pr-4">{f.updatedByFirstName && f.updatedByLastName ? `${f.updatedByFirstName} ${f.updatedByLastName}` : (f.updatedBy || '-')}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          f.status === 'published' ? 'bg-green-100 text-green-800' :
                          f.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {f.status === 'published' ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="text" 
                              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${f.id}`}
                              readOnly
                              className="px-2 py-1 text-xs border rounded bg-gray-50 w-32"
                            />
                            <button 
                              onClick={() => {
                                const link = `${window.location.origin}/forms/${f.id}`
                                navigator.clipboard.writeText(link)
                                alert('Form link copied to clipboard!')
                              }}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              📋
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Not published</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">{(() => { const c = (f.createdAt ?? f.created_at); return c ? new Date(c).toLocaleString() : '-'; })()}</td>
                      <td className="py-2 pr-4 text-right">
                        <button onClick={()=>setSelected(f)} className="px-2 py-1 border rounded-md">Edit</button>
                      </td>
                    </tr>
                  ))}
                  {forms.length === 0 && (
                    <tr><td className="py-4 text-gray-500" colSpan={8}>No forms yet. Create one above.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div>
              {selected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Editing: {selected.name}</h4>
                    <div className="flex items-center gap-3">
                      <select 
                        value={selected.status || 'draft'} 
                        onChange={e => setSelected({...selected, status: e.target.value})}
                        className="px-2 py-1 border rounded-md text-sm"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                      {saveMsg && <span className="text-green-700 text-sm">{saveMsg}</span>}
                      <button onClick={() => setSelected(null)} className="px-3 py-2 bg-gray-500 text-white rounded-md">Close</button>
                      <button onClick={saveSelected} className="px-3 py-2 bg-green-600 text-white rounded-md">Save</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={fieldType} onChange={e=>setFieldType(e.target.value as any)} className="px-2 py-2 border rounded-md">
                      <option value="text">Text</option>
                      <option value="shorttext">Short Text</option>
                      <option value="longtext">Long Text</option>
                      <option value="number">Number (Integer)</option>
                      <option value="decimal">Decimal</option>
                      <option value="currency">Currency</option>
                      <option value="date">Date</option>
                      <option value="time">Time</option>
                      <option value="datetime">Date & Time</option>
                      <option value="select">Select (Dropdown)</option>
                      <option value="radio">Radio</option>
                      <option value="checkbox">Checkbox (Multi)</option>
                      <option value="gps">GPS Location</option>
                      <option value="file">File</option>
                      <option value="photo">Photo</option>
                      <option value="video">Video</option>
                    </select>
                    <input value={fieldLabel} onChange={e=>setFieldLabel(e.target.value)} placeholder="Label" className="px-2 py-2 border rounded-md" />
                    <input value={fieldKey} onChange={e=>setFieldKey(e.target.value)} placeholder="Key (optional)" className="px-2 py-2 border rounded-md" />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={fieldRequired} onChange={e=>setFieldRequired(e.target.checked)} /> Required</label>
                    {(fieldType==='select' || fieldType==='radio' || fieldType==='checkbox') && (
                      <input value={fieldOptions} onChange={e=>setFieldOptions(e.target.value)} placeholder="Options (comma separated)" className="px-2 py-2 border rounded-md col-span-2" />
                    )}
                    {(['file','photo','video'].includes(fieldType)) && (
                      <label className="flex items-center gap-2 text-sm col-span-2"><input type="checkbox" checked={fieldMultiple} onChange={e=>setFieldMultiple(e.target.checked)} /> Allow multiple files</label>
                    )}
                    <button onClick={addField} className="px-3 py-2 border rounded-md col-span-2">Add Field</button>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-2">Fields</div>
                    <ul className="text-sm space-y-1">
                      {(selected.schema?.fields||[]).map((f:any,idx:number)=>(
                        <li key={idx} className="flex justify-between border rounded-md p-2">
                          <span>{f.label} <span className="text-gray-500">({f.type})</span></span>
                          <button onClick={()=>{
                            const next={...selected}; next.schema.fields.splice(idx,1); setSelected(next)
                          }} className="text-red-600">Remove</button>
                        </li>
                      ))}
                      {(!selected.schema||!selected.schema.fields||selected.schema.fields.length===0)&&(
                        <li className="text-gray-500">No fields yet</li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">Select a form to edit fields.</div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
        Next: field editor UI (text/number/date/select/GPS/file), conditional logic, indicator mapping.
      </div>
    </div>
  )
}

function SubmissionsStub() {
  const [forms, setForms] = useState<any[]>([])
  const [formId, setFormId] = useState("")
  const [schema, setSchema] = useState<any>(null)
  const [data, setData] = useState<Record<string, any>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number, accuracy: number} | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const loadForms = async () => {
    const r = await fetch('/api/meal/forms'); const j = await r.json(); if (j.success) setForms(j.data)
  }

  const loadSchema = async (id: string) => {
    if (!id) return
    const r = await fetch(`/api/meal/forms/${id}`); const j = await r.json(); if (j.success) {
      setSchema(j.data.schema)
      // Auto-populate common fields when form loads
      autoPopulateCommonFields(j.data.schema)
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
      
      // Auto-populate GPS fields (if we have location)
      if (gpsLocation && (label.includes('gps') || label.includes('location') || 
          key.includes('gps') || key.includes('location'))) {
        updates[field.key] = `${gpsLocation.lat}, ${gpsLocation.lng}`
      }
    })
    
    if (Object.keys(updates).length > 0) {
      setData(prev => ({ ...prev, ...updates }))
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
          if (schema?.fields) {
            const gpsUpdates: Record<string, any> = {}
            schema.fields.forEach((field: any) => {
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
      if (schema?.fields) {
        const dateTimeUpdates: Record<string, any> = {}
        schema.fields.forEach((field: any) => {
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
        break
      case 'date':
        if (value && isNaN(Date.parse(value))) return 'Invalid date format'
        break
    }
    return null
  }

  const submit = async () => {
    setMessage(null)
    setIsLoading(true)

    // Validate all fields
    const errors: string[] = []
    schema?.fields?.forEach((field: any) => {
      const error = validateField(field, data[field.key])
      if (error) errors.push(error)
    })

    if (errors.length > 0) {
      setMessage(`Validation errors: ${errors.join(', ')}`)
      setIsLoading(false)
      return
    }

    try {
      const r = await fetch(`/api/meal/forms/${formId}/submissions`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          data: {
            ...data,
            gps_location: gpsLocation,
            submission_timestamp: new Date().toISOString(),
            device_info: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              language: navigator.language
            }
          }
        }) 
      })
      const j = await r.json()
      setMessage(j.success ? 'Submitted successfully!' : (j.error || 'Failed to submit'))
      
      if (j.success) {
        // Clear form after successful submission
        setData({})
        setCapturedImage(null)
        setGpsLocation(null)
      }
    } catch (error) {
      setMessage(`Submission error: ${error}`)
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
    
    // Debug logging
    console.log(`Field: ${f.label} (${f.key}) - DateTime: ${isDateTimeField}, GPS: ${isGpsField}`)

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={loadForms} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          🔄 Load Forms
        </button>
        <select 
          value={formId} 
          onChange={e => { setFormId(e.target.value); loadSchema(e.target.value) }} 
          className="px-3 py-2 border rounded-md min-w-[200px]"
        >
          <option value="">Select form</option>
          {forms.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
        </select>
      </div>

      {/* Smart Controls */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold text-gray-800">🧠 Smart Form Features</h3>
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
                schema?.fields?.forEach((field: any) => {
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
          <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
            ✅ GPS: {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)} (Accuracy: {gpsLocation.accuracy.toFixed(0)}m)
          </div>
        )}
        
        {gpsError && (
          <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
            ❌ {gpsError}
          </div>
        )}
      </div>

      {schema?.fields && (
        <div className="space-y-4 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-800">📝 Form Fields</h3>
          {schema.fields.map((f: any) => (
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
              className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 font-medium"
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
      )}
    </div>
  )
}

function IndicatorsStub() {
  const [indicators, setIndicators] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newIndicator, setNewIndicator] = useState({
    name: '',
    description: '',
    category: 'output',
    unit: '',
    baseline: 0,
    target: 0,
    frequency: 'monthly',
    dataSource: '',
    responsiblePerson: '',
    projectId: ''
  })

  useEffect(() => {
    loadProjects()
    loadIndicators()
  }, [])

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/programs/projects')
      const j = await res.json()
      if (j.success) setProjects(j.data)
    } catch (e) { setError('Failed to load projects') }
  }

  const loadIndicators = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/meal/indicators')
      const j = await res.json()
      if (j.success) setIndicators(j.data)
    } catch (e) { setError('Failed to load indicators') }
    finally { setLoading(false) }
  }

  const createIndicator = async () => {
    if (!newIndicator.name || !newIndicator.projectId) {
      setError('Name and project are required')
      return
    }

    try {
      const res = await fetch('/api/meal/indicators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIndicator)
      })
      const j = await res.json()
      if (j.success) {
        setNewIndicator({
          name: '', description: '', category: 'output', unit: '',
          baseline: 0, target: 0, frequency: 'monthly', dataSource: '',
          responsiblePerson: '', projectId: ''
        })
        setShowCreateForm(false)
        loadIndicators()
      } else {
        setError(j.error || 'Failed to create indicator')
      }
    } catch (e) { setError('Failed to create indicator') }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'input': return 'bg-blue-100 text-blue-800'
      case 'output': return 'bg-green-100 text-green-800'
      case 'outcome': return 'bg-yellow-100 text-yellow-800'
      case 'impact': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Indicators & Logframe</h3>
          <p className="text-sm text-gray-600">Monitor project progress with key performance indicators</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedProject} 
            onChange={e => setSelectedProject(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
          >
            ➕ Add Indicator
          </button>
        </div>
      </div>

      {/* Create Indicator Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Create New Indicator</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indicator Name *</label>
              <input 
                type="text"
                value={newIndicator.name}
                onChange={e => setNewIndicator({...newIndicator, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Number of beneficiaries reached"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
              <select 
                value={newIndicator.projectId}
                onChange={e => setNewIndicator({...newIndicator, projectId: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={newIndicator.category}
                onChange={e => setNewIndicator({...newIndicator, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="input">Input</option>
                <option value="output">Output</option>
                <option value="outcome">Outcome</option>
                <option value="impact">Impact</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input 
                type="text"
                value={newIndicator.unit}
                onChange={e => setNewIndicator({...newIndicator, unit: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., people, households, %"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Baseline</label>
              <input 
                type="number"
                value={newIndicator.baseline}
                onChange={e => setNewIndicator({...newIndicator, baseline: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <input 
                type="number"
                value={newIndicator.target}
                onChange={e => setNewIndicator({...newIndicator, target: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select 
                value={newIndicator.frequency}
                onChange={e => setNewIndicator({...newIndicator, frequency: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
              <input 
                type="text"
                value={newIndicator.dataSource}
                onChange={e => setNewIndicator({...newIndicator, dataSource: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., MEAL forms, surveys, reports"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={newIndicator.description}
                onChange={e => setNewIndicator({...newIndicator, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Describe what this indicator measures..."
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={createIndicator}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Indicator
            </button>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Indicators List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="font-semibold text-gray-900">Performance Indicators</h4>
        </div>
        {loading ? (
          <div className="p-4 text-center text-gray-600">Loading indicators...</div>
        ) : indicators.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No indicators found. Create your first indicator above.
          </div>
        ) : (
          <div className="divide-y">
            {indicators
              .filter(ind => !selectedProject || ind.projectId === selectedProject)
              .map(indicator => (
              <div key={indicator.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium text-gray-900">{indicator.name}</h5>
                      <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(indicator.category)}`}>
                        {indicator.category.toUpperCase()}
                      </span>
                    </div>
                    {indicator.description && (
                      <p className="text-sm text-gray-600 mb-2">{indicator.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Baseline:</span>
                        <span className="ml-1 font-medium">{indicator.baseline} {indicator.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <span className="ml-1 font-medium">{indicator.target} {indicator.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Current:</span>
                        <span className="ml-1 font-medium">{indicator.current || 0} {indicator.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Progress:</span>
                        <span className="ml-1 font-medium">
                          {getProgressPercentage(indicator.current || 0, indicator.target)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(indicator.current || 0, indicator.target)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>📊 {indicator.frequency}</span>
                      <span>📋 {indicator.dataSource || 'No source specified'}</span>
                      <span>👤 {indicator.responsiblePerson || 'Not assigned'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                      📊 Update
                    </button>
                    <button className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700">
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-lg">📊</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Total Indicators</p>
              <p className="text-2xl font-bold text-blue-600">{indicators.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-lg">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">On Track</p>
              <p className="text-2xl font-bold text-green-600">
                {indicators.filter(ind => getProgressPercentage(ind.current || 0, ind.target) >= 80).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">At Risk</p>
              <p className="text-2xl font-bold text-yellow-600">
                {indicators.filter(ind => {
                  const progress = getProgressPercentage(ind.current || 0, ind.target)
                  return progress > 0 && progress < 80
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-lg">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Behind</p>
              <p className="text-2xl font-bold text-red-600">
                {indicators.filter(ind => getProgressPercentage(ind.current || 0, ind.target) === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

function DashboardsStub() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedProject, setSelectedProject] = useState('all')
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    loadProjects()
    loadDashboardData()
  }, [selectedPeriod, selectedProject])

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/programs/projects')
      const j = await res.json()
      if (j.success) setProjects(j.data)
    } catch (e) { console.error('Failed to load projects') }
  }

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Simulate loading dashboard data
      const mockData = {
        totalSubmissions: 1247,
        totalForms: 23,
        totalIndicators: 156,
        completionRate: 87.3,
        regionalData: [
          { region: 'Harare', submissions: 456, completion: 92.1 },
          { region: 'Bulawayo', submissions: 234, completion: 85.4 },
          { region: 'Mutare', submissions: 189, completion: 89.2 },
          { region: 'Gweru', submissions: 156, completion: 78.9 },
          { region: 'Masvingo', submissions: 212, completion: 91.3 }
        ],
        genderData: [
          { gender: 'Male', count: 678, percentage: 54.4 },
          { gender: 'Female', count: 569, percentage: 45.6 }
        ],
        ageGroups: [
          { ageGroup: '18-25', count: 234, percentage: 18.8 },
          { ageGroup: '26-35', count: 456, percentage: 36.6 },
          { ageGroup: '36-45', count: 345, percentage: 27.7 },
          { ageGroup: '46-55', count: 156, percentage: 12.5 },
          { ageGroup: '55+', count: 56, percentage: 4.5 }
        ],
        trendData: [
          { month: 'Jan', submissions: 89, indicators: 12 },
          { month: 'Feb', submissions: 134, indicators: 15 },
          { month: 'Mar', submissions: 156, indicators: 18 },
          { month: 'Apr', submissions: 189, indicators: 22 },
          { month: 'May', submissions: 234, indicators: 28 },
          { month: 'Jun', submissions: 267, indicators: 32 },
          { month: 'Jul', submissions: 298, indicators: 35 },
          { month: 'Aug', submissions: 312, indicators: 38 },
          { month: 'Sep', submissions: 289, indicators: 34 },
          { month: 'Oct', submissions: 267, indicators: 31 },
          { month: 'Nov', submissions: 234, indicators: 28 },
          { month: 'Dec', submissions: 198, indicators: 24 }
        ],
        topForms: [
          { name: 'Beneficiary Survey', submissions: 456, completion: 94.2 },
          { name: 'Impact Assessment', submissions: 234, completion: 87.1 },
          { name: 'Baseline Study', submissions: 189, completion: 91.3 },
          { name: 'Follow-up Survey', submissions: 156, completion: 83.7 },
          { name: 'Exit Interview', submissions: 123, completion: 89.5 }
        ],
        indicatorProgress: [
          { name: 'Number of beneficiaries reached', current: 1247, target: 1500, progress: 83.1 },
          { name: 'Training sessions conducted', current: 45, target: 60, progress: 75.0 },
          { name: 'Community meetings held', current: 78, target: 100, progress: 78.0 },
          { name: 'Reports submitted', current: 23, target: 24, progress: 95.8 },
          { name: 'Stakeholder engagement', current: 156, target: 200, progress: 78.0 }
        ]
      }
      setDashboardData(mockData)
    } catch (e) { console.error('Failed to load dashboard data') }
    finally { setLoading(false) }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600'
    if (progress >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressBgColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-100'
    if (progress >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load dashboard data</p>
        <button 
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics & Dashboards</h3>
          <p className="text-sm text-gray-600">Comprehensive monitoring and evaluation insights</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod} 
            onChange={e => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
          <select 
            value={selectedProject} 
            onChange={e => setSelectedProject(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button 
            onClick={loadDashboardData}
            className="px-3 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalSubmissions.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Forms</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalForms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Indicators</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalIndicators}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-orange-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Performance */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">📍 Regional Performance</h4>
        <div className="space-y-3">
          {dashboardData.regionalData.map((region: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">{region.region}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{region.submissions}</span> submissions
                </div>
                <div className="text-sm">
                  <span className={`font-medium ${getProgressColor(region.completion)}`}>
                    {region.completion}%
                  </span>
                  <span className="text-gray-600 ml-1">completion</span>
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressBgColor(region.completion).replace('bg-', 'bg-')}`}
                    style={{ width: `${region.completion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">👥 Gender Distribution</h4>
          <div className="space-y-3">
            {dashboardData.genderData.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${index === 0 ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                  <span className="font-medium text-gray-900">{item.gender}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{item.count}</span>
                  <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Groups */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">📅 Age Groups</h4>
          <div className="space-y-3">
            {dashboardData.ageGroups.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">{item.ageGroup}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{item.count}</span>
                  <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">📈 Trend Analysis</h4>
        <div className="grid grid-cols-12 gap-2 mb-4">
          {dashboardData.trendData.map((item: any, index: number) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-600 mb-1">{item.month}</div>
              <div className="space-y-1">
                <div className="h-16 bg-blue-100 rounded flex items-end">
                  <div 
                    className="w-full bg-blue-600 rounded-t"
                    style={{ height: `${(item.submissions / 350) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600">{item.submissions}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Submissions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Indicators</span>
          </div>
        </div>
      </div>

      {/* Top Forms */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Forms</h4>
        <div className="space-y-3">
          {dashboardData.topForms.map((form: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-orange-600 font-bold text-sm">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{form.name}</p>
                  <p className="text-sm text-gray-600">{form.submissions} submissions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{form.completion}%</p>
                  <p className="text-xs text-gray-600">completion</p>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${form.completion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicator Progress */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 Indicator Progress</h4>
        <div className="space-y-4">
          {dashboardData.indicatorProgress.map((indicator: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{indicator.name}</h5>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getProgressBgColor(indicator.progress)} ${getProgressColor(indicator.progress)}`}>
                  {indicator.progress}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Current: {indicator.current.toLocaleString()}</span>
                <span>Target: {indicator.target.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    indicator.progress >= 90 ? 'bg-green-600' :
                    indicator.progress >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${indicator.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">📤 Export & Reports</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <h5 className="font-medium text-gray-900">Excel Report</h5>
              <p className="text-sm text-gray-600">Download detailed data</p>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <h5 className="font-medium text-gray-900">Power BI</h5>
              <p className="text-sm text-gray-600">Advanced analytics</p>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <h5 className="font-medium text-gray-900">Geospatial Map</h5>
              <p className="text-sm text-gray-600">Regional visualization</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function RepositoryStub() {
  return (
    <StubBlock
      title="Data Repository & Reports"
      items={[
        "Versioned datasets by project",
        "One-click Excel/CSV/PDF exports",
        "Auto-generated monthly/quarterly donor reports"
      ]}
    />
  )
}

function FeedbackStub() {
  return (
    <StubBlock
      title="Accountability & Feedback"
      items={[
        "Digital suggestion box + SMS/WhatsApp integration",
        "Anonymous reporting and escalation rules",
        "Feedback tracking dashboards"
      ]}
    />
  )
}

function SettingsStub() {
  return (
    <StubBlock
      title="Roles & Access Control"
      items={[
        "Admin / Advanced / Basic / Partner / Viewer roles",
        "Project-scoped permissions and form-level publish controls",
        "Future: AI insights and risk flags"
      ]}
    />
  )
}


