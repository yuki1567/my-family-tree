<template>
  <div class="form-field-label">
    <div class="form-field-label-text">
      {{ label }}
      <span
        v-if="required"
        class="form-field-required"
      >*</span>
    </div>

    <!-- Radio buttons -->
    <div
      v-if="type === 'radio'"
      class="form-field-radio-group"
    >
      <label
        v-for="option in options"
        :key="option.value"
        class="form-field-radio-label-button"
        :style="
          inputValue === option.value
            ? {
              borderColor: getOptionColor(option.value).border,
              backgroundColor: getOptionColor(option.value).background,
            }
            : {}
        "
      >
        <input
          v-model="inputValue"
          type="radio"
          :name="name"
          :value="option.value"
          :required="required"
          class="form-field-radio-input-button"
        >
        <component
          :is="option.icon"
          class="form-field-radio-icon"
          :style="
            inputValue === option.value
              ? {
                color: getOptionColor(option.value).text,
              }
              : {}
          "
        />
        <span
          class="form-field-radio-text"
          :style="
            inputValue === option.value
              ? {
                color: getOptionColor(option.value).text,
              }
              : {}
          "
        >{{ option.label }}</span>
      </label>
    </div>

    <!-- Regular input -->
    <input
      v-else
      v-model="inputValue"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :required="required"
      :class="inputClasses"
    >

    <div
      v-if="errorMessage"
      class="form-field-error"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

type RadioOption = {
  label: string
  value: string
  icon?: Component
}

type Props = {
  modelValue?: string | number
  label: string
  type?: 'text' | 'number' | 'date' | 'radio'
  name: string
  placeholder?: string
  required?: boolean
  errorMessage?: string
  options?: RadioOption[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  required: false,
})

type Emits = {
  'update:modelValue': [value: string | number]
}

const emit = defineEmits<Emits>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string | number) => {
    emit('update:modelValue', value)
  },
})

const inputClasses = computed(() => [
  'form-field-input',
  {
    'form-field-input-error': props.errorMessage,
  },
])

const getOptionColor = (value: string | number) => {
  const colorMap: Record<
    string,
    { border: string, background: string, text: string }
  > = {
    male: { border: '#3b82f6', background: '#eff6ff', text: '#3b82f6' },
    female: { border: '#ec4899', background: '#fdf2f8', text: '#ec4899' },
    unknown: { border: '#d1d5db', background: '#e9eaec', text: '#707a89' },
    father: { border: '#3b82f6', background: '#eff6ff', text: '#3b82f6' },
    mother: { border: '#ec4899', background: '#fdf2f8', text: '#ec4899' },
    spouse: { border: '#ef4444', background: '#fef2f2', text: '#ef4444' },
    child: { border: '#10b981', background: '#f0fdf4', text: '#10b981' },
  }
  return (
    colorMap[String(value)] || {
      border: '#3b82f6',
      background: '#eff6ff',
      text: '#3b82f6',
    }
  )
}
</script>

<style scoped>
.form-field-label {
  font-size: 1.4rem;
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field-label-text {
  display: flex;
  align-items: center;
  gap: 0.22rem;
}

.form-field-required {
  color: var(--color-danger);
}

.form-field-input {
  width: 100%;
  border: 1px solid var(--color-border-primary);
  border-radius: 0.6rem;
  background-color: var(--color-bg-primary);
  font-size: 1.4rem;
  padding: 0.6rem 1.2rem;
  transition: all 0.2s ease-in-out;
}

.form-field-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-field-input::placeholder {
  color: var(--color-text-secondary);
}

/* States */
.form-field-input-error {
  border-color: var(--color-danger);
}

.form-field-input-error:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-field-error {
  font-size: 1.2rem;
  color: var(--color-danger);
}

/* Radio buttons */
.form-field-radio-group {
  display: flex;
  gap: 2rem;
}

/* Button-style radio buttons */
.form-field-radio-label-button {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  padding: 0.8rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 0.6rem;
  background-color: var(--color-white);
  font-size: 1.4rem;
  color: var(--color-text-primary);
}

.form-field-radio-label-button:hover {
  border-color: var(--color-border-secondary);
  background-color: var(--color-bg-tertiary);
}

.form-field-radio-input-button {
  display: none;
}

.form-field-radio-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-text-tertiary);
}
</style>
