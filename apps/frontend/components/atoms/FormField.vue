<template>
  <div class="form-field-label">
    <div class="form-field-label-text">
      {{ label }}
      <span v-if="required" class="form-field-required">*</span>
    </div>

    <!-- Radio buttons -->
    <div v-if="type === 'radio'" class="form-field-radio-group">
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
        />
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
          >{{ option.label }}</span
        >
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
    />

    <div v-if="errorMessage" class="form-field-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import {
  GENDER_CSS_KEYS,
  RELATIONSHIP_CSS_KEYS,
  type Gender,
  type Relationship,
} from '@shared/types/person'

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

const getCSSVariable = (variableName: string): string => {
  if (typeof window === 'undefined' || !document.documentElement) {
    return ''
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()
}

const getOptionColor = (optionValue: string) => {
  const colorKey =
    GENDER_CSS_KEYS[optionValue as Gender] ||
    RELATIONSHIP_CSS_KEYS[optionValue as Relationship] ||
    'gender-male'

  return {
    border: getCSSVariable(`--color-${colorKey}-border`),
    background: getCSSVariable(`--color-${colorKey}-background`),
    text: getCSSVariable(`--color-${colorKey}`),
  }
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
