<template>
  <div class="form-field">
    <label v-if="label" :for="fieldId" class="form-field-label">
      {{ label }}
      <span v-if="required" class="form-field-required">*</span>
    </label>

    <div class="form-field-input-wrapper">
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

    <div v-if="hasError" class="form-field-error">
      {{ errorMessage }}
    </div>

    <div v-else-if="helpText" class="form-field-help">
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
  'form-field-input',
  `form-field-input-${props.size}`,
  {
    'form-field-input-error': hasError.value,
    'form-field-input-disabled': props.disabled,
    'form-field-input-readonly': props.readonly,
    'form-field-input-focused': isFocused.value,
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

.form-field-label {
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 2px;
}

.form-field-required {
  color: #ef4444;
}

.form-field-input-wrapper {
  position: relative;
}

.form-field-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background);
  font-size: 1.6rem;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
}

.form-field-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-field-input::placeholder {
  color: var(--color-text-secondary);
}

/* Sizes */
.form-field-input-small {
  padding: 0.6rem 1.2rem;
  font-size: 1.4rem;
}

.form-field-input-medium {
  padding: 0.8rem 1.2rem;
  font-size: 1.6rem;
}

.form-field-input-large {
  padding: 1.2rem 1.6rem;
  font-size: 1.8rem;
}

/* States */
.form-field-input-error {
  border-color: #ef4444;
}

.form-field-input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-field-input-disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.form-field-input-readonly {
  background-color: #f9fafb;
  cursor: default;
}

.form-field-error {
  font-size: 1.2rem;
  color: #ef4444;
}

.form-field-help {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
}
</style>
