export type DisplayVariant = 'title' | 'heading' | 'description' | 'divider'

export type AnswerableFieldType =
  | 'short_text'
  | 'paragraph'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'number'
  | 'date'

export interface BaseField {
  id: string
}

export interface DisplayField extends BaseField {
  type: 'display'
  variant: DisplayVariant
  text?: string
  level?: 1 | 2 | 3
  style?: {
    fontFamily?: string
    bold?: boolean
    italic?: boolean
    align?: 'left' | 'center' | 'right'
  }
}

export interface AnswerableField extends BaseField {
  type: AnswerableFieldType
  label: string
  required?: boolean
  options?: string[]
}

export type FormField = DisplayField | AnswerableField

export interface FormDefinition {
  id: string
  name: string
  fields: FormField[]
}

export type FormValues = Record<string, unknown>

export interface FormAnswer {
  fieldId: string
  value: unknown
}

export function buildAnswers(fields: FormField[], values: FormValues): FormAnswer[] {
  return fields
    .filter(function (f) { return f.type !== 'display' })
    .map(function (f) {
      return { fieldId: f.id, value: values[f.id] }
    })
}

