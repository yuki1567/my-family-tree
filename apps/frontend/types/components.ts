// Atomicデザインコンポーネント用型定義

// Button関連
export type ButtonVariant = 'primary' | 'secondary' | 'danger'
export type ButtonSize = 'small' | 'medium' | 'large'

// Input関連
export type InputType = 'text' | 'email' | 'date' | 'number' | 'tel'

// 共通型
export type Gender = 'male' | 'female' | 'unknown'

// Person型（Phase 1-A用）
export type Person = {
  readonly id: string
  name?: string
  gender?: Gender
  birthDate?: string
  deathDate?: string
  photo?: string
  birthPlace?: string
  memo?: string
}

// FormField関連
export type FormFieldError = {
  field: string
  message: string
}

// AppButton関連
export type AppButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export type AppButtonEmits = {
  click: [event: MouseEvent]
}

// AppInput関連
export type AppInputProps = {
  modelValue?: string
  type?: InputType
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
}

export type AppInputEmits = {
  'update:modelValue': [value: string]
}

// LoadingSpinner関連
export type LoadingSpinnerProps = {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

// FormField関連
export type FormFieldProps = {
  label: string
  modelValue?: string
  type?: InputType
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

export type FormFieldEmits = {
  'update:modelValue': [value: string]
}

// PersonCard関連
export type PersonCardProps = {
  person: Person
  clickable?: boolean
}

export type PersonCardEmits = {
  click: [person: Person]
}

// SVG家系図関連（Phase 1-A実装中）
export type Position = {
  x: number
  y: number
}

export type Relationship = {
  readonly id: string
  parentId: string
  childId: string
  type: 'biological' | 'adopted'
}

// FamilyTreeCanvas関連
export type FamilyTreeCanvasProps = {
  people?: Person[]
  relationships?: Relationship[]
}

export type FamilyTreeCanvasEmits = {
  personClick: [person: Person]
  canvasClick: [event: MouseEvent]
}

// PersonNode関連
export type PersonNodeProps = {
  person: Person
  position: Position
  isSelected?: boolean
}

export type PersonNodeEmits = {
  click: [person: Person]
}

// RelationshipLine関連
export type RelationshipLineProps = {
  parentPosition: Position
  childPosition: Position
  relationshipType: 'biological' | 'adopted'
}