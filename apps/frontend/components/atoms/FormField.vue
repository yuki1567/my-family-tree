<template>
  <div class="form-field">
    <label v-if="label" :for="fieldId" class="form-field__label">
      {{ label }}
      <span v-if="required" class="form-field__required">*</span>
    </label>

    <div class="form-field__input-wrapper">
      <input
        :id="fieldId"
        v-model="inputValue"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClasses"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      />
    </div>

    <div v-if="hasError" class="form-field__error">
      {{ errorMessage }}
    </div>

    <div v-else-if="helpText" class="form-field__help">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Props = {
  modelValue?: string | number
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date'
  name?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  helpText?: string
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  size: 'medium',
})

type Emits = {
  'update:modelValue': [value: string | number]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'input': [event: Event]
}

const emit = defineEmits<Emits>()

const isFocused = ref(false)

const fieldId = computed(() => {
  return props.name || `field-${Math.random().toString(36).substr(2, 9)}`
})

const hasError = computed(() => {
  return Boolean(props.error)
})

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string | number) => {
    emit('update:modelValue', value)
  },
})

const inputClasses = computed(() => [
  'form-field__input',
  `form-field__input--${props.size}`,
  {
    'form-field__input--error': hasError.value,
    'form-field__input--disabled': props.disabled,
    'form-field__input--readonly': props.readonly,
    'form-field__input--focused': isFocused.value,
  },
])

const errorMessage = computed(() => props.error)

const handleBlur = (event: FocusEvent): void => {
  isFocused.value = false
  emit('blur', event)
}

const handleFocus = (event: FocusEvent): void => {
  isFocused.value = true
  emit('focus', event)
}

const handleInput = (event: Event): void => {
  emit('input', event)
}
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 2px;
}

.form-field__required {
  color: #ef4444;
}

.form-field__input-wrapper {
  position: relative;
}

.form-field__input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background);
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
}

.form-field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-field__input::placeholder {
  color: var(--color-text-secondary);
}

/* Sizes */
.form-field__input--small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.form-field__input--medium {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}

.form-field__input--large {
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

/* States */
.form-field__input--error {
  border-color: #ef4444;
}

.form-field__input--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-field__input--disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.form-field__input--readonly {
  background-color: #f9fafb;
  cursor: default;
}

.form-field__error {
  font-size: 0.75rem;
  color: #ef4444;
}

.form-field__help {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
