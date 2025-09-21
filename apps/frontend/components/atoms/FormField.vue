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
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
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
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  input: [event: Event]
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
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 2px;
}

.form-field__required {
  color: #dc3545;
}

.form-field__input-wrapper {
  position: relative;
}

.form-field__input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
}

.form-field__input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-field__input::placeholder {
  color: #9ca3af;
}

/* Sizes */
.form-field__input--small {
  padding: 6px 8px;
  font-size: 12px;
}

.form-field__input--medium {
  padding: 8px 12px;
  font-size: 14px;
}

.form-field__input--large {
  padding: 12px 16px;
  font-size: 16px;
}

/* States */
.form-field__input--error {
  border-color: #dc3545;
}

.form-field__input--error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
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
  font-size: 12px;
  color: #dc3545;
}

.form-field__help {
  font-size: 12px;
  color: #6b7280;
}
</style>