'use client'

import React, { useMemo, useState } from 'react'
import FieldRenderer from './FieldRenderer'
import { FormField, DisplayVariant, buildAnswers } from '@/types/form-builder'

interface FormBuilderProps {
  initialFields?: FormField[]
  onSubmit: (payload: { fields: FormField[]; answers: { fieldId: string; value: unknown }[] }) => void
}

export default function FormBuilder(props: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(props.initialFields || [])
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  function addDisplay(variant: DisplayVariant) {
    const id = 'fld_' + Math.random().toString(36).slice(2)
    const newField: FormField = variant === 'divider' ? { id, type: 'display', variant } : {
      id,
      type: 'display',
      variant,
      text: variant === 'title' ? 'Form Title' : variant === 'heading' ? 'Section Heading' : 'Description text',
      level: variant === 'heading' ? 1 : undefined,
      style: { align: 'left' }
    }
    setFields(function (prev) { return prev.concat([newField]) })
  }

  function addAnswerable(type: Extract<FormField, { type: string }>['type']) {
    if (type === 'display') return
    const id = 'fld_' + Math.random().toString(36).slice(2)
    const base: any = { id, type, label: 'Untitled Question', required: false }
    if (type === 'radio' || type === 'checkbox' || type === 'select') base.options = ['Option 1', 'Option 2']
    setFields(function (prev) { return prev.concat([base]) })
  }

  function updateField(index: number, updated: FormField) {
    setFields(function (prev) { return prev.map(function (f, i) { return i === index ? updated : f }) })
  }

  function removeField(index: number) {
    setFields(function (prev) { return prev.filter(function (_, i) { return i !== index }) })
  }

  function handleChange(fieldId: string, value: unknown) {
    setValues(function (prev) { const next = { ...prev }; next[fieldId] = value; return next })
  }

  const answers = useMemo(function () { return buildAnswers(fields, values) }, [fields, values])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-4">
        {fields.length === 0 && (
          <div className="text-gray-500">No fields yet. Use the toolbar to add fields.</div>
        )}
        {fields.map(function (field, idx) {
          const isDisplay = field.type === 'display'
          return (
            <div
              key={field.id}
              className={"bg-white border rounded-lg p-4 cursor-pointer " + (selectedIndex === idx ? 'ring-2 ring-saywhat-orange' : '')}
              onClick={function () { setSelectedIndex(idx) }}
            >
              {isDisplay && field.variant !== 'divider' ? (
                <input
                  className="w-full mb-3 px-3 py-2 border rounded-md"
                  placeholder={field.variant === 'title' ? 'Title' : field.variant === 'heading' ? 'Heading' : 'Description'}
                  value={field.text || ''}
                  onChange={function (e) { updateField(idx, Object.assign({}, field, { text: e.target.value })) }}
                />
              ) : null}

              {isDisplay && field.variant === 'heading' ? (
                <select
                  className="mb-3 px-3 py-2 border rounded-md"
                  value={field.level || 1}
                  onChange={function (e) { updateField(idx, Object.assign({}, field, { level: Number(e.target.value) as 1 | 2 | 3 })) }}
                >
                  <option value={1}>H1</option>
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                </select>
              ) : null}

              <FieldRenderer
                field={field}
                value={values[field.id]}
                onChange={function (v) { handleChange(field.id, v) }}
              />

              <div className="mt-3 flex gap-2">
                <button className="text-sm text-red-600" onClick={function () { removeField(idx) }}>Remove</button>
              </div>
            </div>
          )
        })}

        <div>
          <button
            className="px-4 py-2 bg-saywhat-orange text-white rounded-md"
            onClick={function () { props.onSubmit({ fields, answers }) }}
          >
            Save Form
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-3">Display blocks</div>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-3 py-2 border rounded" onClick={function () { addDisplay('title') }}>Title</button>
            <button className="px-3 py-2 border rounded" onClick={function () { addDisplay('heading') }}>Heading</button>
            <button className="px-3 py-2 border rounded" onClick={function () { addDisplay('description') }}>Description</button>
            <button className="px-3 py-2 border rounded" onClick={function () { addDisplay('divider') }}>Divider</button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-3">Questions</div>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-3 py-2 border rounded" onClick={function () { addAnswerable('short_text') }}>Short Text</button>
            <button className="px-3 py-2 border rounded" onClick={function () { addAnswerable('paragraph') }}>Paragraph</button>
            <button className="px-3 py-2 border rounded" onClick={function () { addAnswerable('radio') }}>Radio</button>
            <button className="px-3 py-2 border rounded" onClick={function () { addAnswerable('checkbox') }}>Checkbox</button>
            <button className="px-3 py-2 border rounded" onClick={function () { addAnswerable('select') }}>Select</button>
            <button className="px-3 py-2 border rounded" onClick={function () { addAnswerable('number') }}>Number</button>
            <button className="px-3 py-2 border rounded" onClick={function () { addAnswerable('date') }}>Date</button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-3">Text Settings</div>
          {selectedIndex === null || fields[selectedIndex].type !== 'display' ? (
            <div className="text-sm text-gray-500">Select a Title/Heading/Description to edit text styles.</div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean((fields[selectedIndex] as any).style && (fields[selectedIndex] as any).style.bold)}
                    onChange={function (e) {
                      const f = fields[selectedIndex] as any
                      updateField(selectedIndex, Object.assign({}, f, { style: Object.assign({}, f.style, { bold: e.target.checked }) }))
                    }}
                  />
                  <span>Bold</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean((fields[selectedIndex] as any).style && (fields[selectedIndex] as any).style.italic)}
                    onChange={function (e) {
                      const f = fields[selectedIndex] as any
                      updateField(selectedIndex, Object.assign({}, f, { style: Object.assign({}, f.style, { italic: e.target.checked }) }))
                    }}
                  />
                  <span>Italic</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Align</span>
                <select
                  className="px-2 py-1 border rounded text-sm"
                  value={((fields[selectedIndex] as any).style && (fields[selectedIndex] as any).style.align) || 'left'}
                  onChange={function (e) {
                    const f = fields[selectedIndex] as any
                    updateField(selectedIndex, Object.assign({}, f, { style: Object.assign({}, f.style, { align: e.target.value as 'left' | 'center' | 'right' }) }))
                  }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Font family</span>
                <input
                  className="px-2 py-1 border rounded text-sm"
                  placeholder="e.g., Inter"
                  value={(((fields[selectedIndex] as any).style && (fields[selectedIndex] as any).style.fontFamily) || '') as string}
                  onChange={function (e) {
                    const f = fields[selectedIndex] as any
                    updateField(selectedIndex, Object.assign({}, f, { style: Object.assign({}, f.style, { fontFamily: e.target.value }) }))
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-2">Live payload (answers only)</div>
          <pre className="text-xs bg-gray-50 p-2 rounded border overflow-auto max-h-64">{JSON.stringify(answers, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}


