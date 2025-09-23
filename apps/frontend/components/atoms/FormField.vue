<template>
  <label class="form-field-label">
    <div class="form-field-label-text">
      {{ label }}
      <span v-if="required" class="form-field-required">*</span>
    </div>
    <input
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
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  modelValue?: string | number
  label: string
  type?: 'text' | 'number' | 'date'
  name: string
  placeholder?: string
  required?: boolean
  errorMessage?: string
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
</script>

<style scoped>
.form-field-label {
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-text);
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
  color: #ef4444;
}

.form-field-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 0.6rem;
  background-color: var(--color-background);
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
  border-color: #ef4444;
}

.form-field-input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-field-error {
  font-size: 1.2rem;
  color: #ef4444;
}
</style>
