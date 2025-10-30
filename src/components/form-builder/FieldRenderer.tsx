'use client'

import React from 'react'
import { FormField } from '@/types/form-builder'

interface FieldRendererProps {
  field: FormField
  value?: unknown
  onChange?: (value: unknown) => void
}

export default function FieldRenderer(props: FieldRendererProps) {
  const field = props.field
  if (field.type === 'display') {
    const weight = field.style && field.style.bold ? ' font-bold' : ''
    const italic = field.style && field.style.italic ? ' italic' : ''
    const align = field.style && field.style.align ? ' text-' + field.style.align : ''
    const fontFamily = field.style && field.style.fontFamily ? { fontFamily: field.style.fontFamily } : undefined
    if (field.variant === 'divider') {
      return <hr className="my-4" />
    }
    if (field.variant === 'title') {
      return <h1 style={fontFamily} className={"text-2xl" + weight + italic + align}>{field.text}</h1>
    }
    if (field.variant === 'heading') {
      const level = field.level || 1
      const base = level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'
      const cls = base + ' font-semibold' + weight + italic + align
      return <div style={fontFamily} className={cls}>{field.text}</div>
    }
    return <p style={fontFamily} className={"text-gray-600" + weight + italic + align}>{field.text}</p>
  }

  const common = 'w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-saywhat-orange'

  if (field.type === 'short_text') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
        <input
          className={common}
          type="text"
          onChange={function (e) { props.onChange && props.onChange(e.target.value) }}
          value={(props.value as string) || ''}
        />
      </div>
    )
  }

  if (field.type === 'number') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
        <input
          className={common}
          type="number"
          onChange={function (e) { props.onChange && props.onChange(e.target.value === '' ? '' : Number(e.target.value)) }}
          value={props.value as number | string | undefined}
        />
      </div>
    )
  }

  if (field.type === 'paragraph') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
        <textarea
          className={common}
          rows={4}
          onChange={function (e) { props.onChange && props.onChange(e.target.value) }}
          value={(props.value as string) || ''}
        />
      </div>
    )
  }

  if (field.type === 'date') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
        <input
          className={common}
          type="date"
          onChange={function (e) { props.onChange && props.onChange(e.target.value) }}
          value={(props.value as string) || ''}
        />
      </div>
    )
  }

  if (field.type === 'radio') {
    return (
      <div>
        <div className="block text-sm font-medium text-gray-700 mb-1">{field.label}</div>
        <div className="space-y-2">
          {(field.options || []).map(function (opt) {
            const id = field.id + '_' + opt
            return (
              <label key={id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  checked={props.value === opt}
                  onChange={function () { props.onChange && props.onChange(opt) }}
                />
                <span>{opt}</span>
              </label>
            )
          })}
        </div>
      </div>
    )
  }

  if (field.type === 'checkbox') {
    const selected = Array.isArray(props.value) ? (props.value as string[]) : []
    return (
      <div>
        <div className="block text-sm font-medium text-gray-700 mb-1">{field.label}</div>
        <div className="space-y-2">
          {(field.options || []).map(function (opt) {
            const id = field.id + '_' + opt
            const isChecked = selected.indexOf(opt) !== -1
            return (
              <label key={id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={function (e) {
                    if (!props.onChange) return
                    if (e.target.checked) props.onChange(selected.concat([opt]))
                    else props.onChange(selected.filter(function (s) { return s !== opt }))
                  }}
                />
                <span>{opt}</span>
              </label>
            )
          })}
        </div>
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
        <select
          className={common}
          value={(props.value as string) || ''}
          onChange={function (e) { props.onChange && props.onChange(e.target.value) }}
        >
          <option value=""></option>
          {(field.options || []).map(function (opt) {
            return <option key={opt} value={opt}>{opt}</option>
          })}
        </select>
      </div>
    )
  }

  return null
}


