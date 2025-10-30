"use client"

import { useState } from "react"
import FormBuilder from "@/components/form-builder/FormBuilder"
import { FormField } from "@/types/form-builder"

export default function MealFormCreatePage() {
  const [saved, setSaved] = useState<null | { fields: FormField[]; answers: { fieldId: string; value: unknown }[] }>(null)

  function handleSubmit(payload: { fields: FormField[]; answers: { fieldId: string; value: unknown }[] }) {
    setSaved(payload)
    // TODO: integrate with backend API once available
    // fetch('/api/meal/forms', { method: 'POST', body: JSON.stringify(payload) })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Create MEAL Form</h1>
        <p className="text-gray-600 mb-6">Add headings, titles, and descriptions as read-only display blocks. Only questions produce answers on submit.</p>
        <FormBuilder onSubmit={handleSubmit} />

        {saved && (
          <div className="mt-6 bg-white border rounded-lg p-4">
            <div className="font-semibold mb-2">Saved payload</div>
            <pre className="text-xs bg-gray-50 p-2 rounded border overflow-auto">{JSON.stringify(saved, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}


