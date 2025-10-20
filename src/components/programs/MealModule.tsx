"use client"

import { useState } from "react"

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
  const [selected, setSelected] = useState<any | null>(null)
  const [fieldType, setFieldType] = useState<'text'|'shorttext'|'longtext'|'number'|'decimal'|'currency'|'date'|'time'|'datetime'|'select'|'radio'|'checkbox'|'gps'|'file'|'photo'|'video'>('text')
  const [fieldLabel, setFieldLabel] = useState("")
  const [fieldKey, setFieldKey] = useState("")
  const [fieldRequired, setFieldRequired] = useState(false)
  const [fieldOptions, setFieldOptions] = useState("")
  const [fieldMultiple, setFieldMultiple] = useState(false)

  const load = async () => {
    try {
      setLoading(true); setError(null)
      const res = await fetch('/api/meal/forms')
      const j = await res.json()
      if (!j.success) throw new Error(j.error || 'Failed to fetch')
      setForms(j.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const create = async () => {
    try {
      setCreating(true); setError(null)
      const res = await fetch('/api/meal/forms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, schema: { fields: [] } })})
      const j = await res.json()
      if (!j.success) throw new Error(j.error || 'Failed to create')
      setName(""); await load()
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
      <div className="flex items-center gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Form name" className="px-3 py-2 border rounded-md w-64" />
        <button onClick={create} disabled={!name || creating} className="px-3 py-2 bg-orange-600 text-white rounded-md disabled:opacity-50">Create</button>
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
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {forms.map(f => (
                    <tr key={f.id}>
                      <td className="py-2 pr-4">{f.name}</td>
                      <td className="py-2 pr-4">{f.status}</td>
                      <td className="py-2 pr-4">{(() => { const c = (f.createdAt ?? f.created_at); return c ? new Date(c).toLocaleString() : '-'; })()}</td>
                      <td className="py-2 pr-4 text-right">
                        <button onClick={()=>setSelected(f)} className="px-2 py-1 border rounded-md">Edit</button>
                      </td>
                    </tr>
                  ))}
                  {forms.length === 0 && (
                    <tr><td className="py-4 text-gray-500" colSpan={4}>No forms yet. Create one above.</td></tr>
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
                      {saveMsg && <span className="text-green-700 text-sm">{saveMsg}</span>}
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

  const loadForms = async () => {
    const r = await fetch('/api/meal/forms'); const j = await r.json(); if (j.success) setForms(j.data)
  }

  const loadSchema = async (id: string) => {
    if (!id) return
    const r = await fetch(`/api/meal/forms/${id}`); const j = await r.json(); if (j.success) setSchema(j.data.schema)
  }

  const submit = async () => {
    setMessage(null)
    const r = await fetch(`/api/meal/forms/${formId}/submissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) })
    const j = await r.json(); setMessage(j.success ? 'Submitted' : (j.error || 'Failed'))
  }

  const renderField = (f: any) => {
    const common = { className: 'px-2 py-2 border rounded-md w-full', value: data[f.key]||'', onChange: (e:any)=>setData(prev=>({...prev,[f.key]: e.target.value})) }
    switch(f.type){
      case 'number': return <input type="number" {...common} />
      case 'date': return <input type="date" {...common} />
      case 'select': return <select {...common as any}>{(f.options||[]).map((o:string)=>(<option key={o}>{o}</option>))}</select>
      default: return <input type="text" {...common} />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={loadForms} className="px-3 py-2 border rounded-md">Load Forms</button>
        <select value={formId} onChange={e=>{setFormId(e.target.value); loadSchema(e.target.value)}} className="px-3 py-2 border rounded-md">
          <option value="">Select form</option>
          {forms.map(f=>(<option key={f.id} value={f.id}>{f.name}</option>))}
        </select>
      </div>
      {schema?.fields && (
        <div className="space-y-3 max-w-xl">
          {schema.fields.map((f:any)=> (
            <div key={f.key} className="space-y-1">
              <div className="text-sm font-medium">{f.label}{f.required && <span className="text-red-600"> *</span>}</div>
              {renderField(f)}
            </div>
          ))}
          <button onClick={submit} className="px-3 py-2 bg-orange-600 text-white rounded-md">Submit</button>
          {message && <div className="text-sm text-gray-700">{message}</div>}
        </div>
      )}
    </div>
  )
}

function IndicatorsStub() {
  return (
    <StubBlock
      title="Indicators & Logframe"
      items={[
        "Define baselines, targets for inputs/outputs/outcomes/impact",
        "Map form questions to indicators and auto-aggregate",
        "Achievement vs target dashboards per project/region"
      ]}
    />
  )
}

function DashboardsStub() {
  return (
    <StubBlock
      title="Analytics & Dashboards"
      items={[
        "Progress by region/gender/age; geospatial maps",
        "Trend lines (monthly/quarterly) and donor-ready views",
        "Power BI / Recharts integration"
      ]}
    />
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


