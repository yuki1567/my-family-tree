<template>
  <input
    :type="type ?? 'text'"
    :value="modelValue ?? ''"
    :placeholder="placeholder ?? ''"
    :disabled="disabled ?? false"
    :required="required ?? false"
    :class="inputClasses"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppInputProps } from '@/types/components'

const props = withDefaults(defineProps<AppInputProps>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputClasses = computed(() => [
  'app-input',
  {
    'app-input--error': props.error,
    'app-input--disabled': props.disabled
  }
])

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.app-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;
  background-color: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.app-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.app-input::placeholder {
  color: var(--color-text-secondary);
}

.app-input--error {
  border-color: #EF4444;
}

.app-input--error:focus {
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.app-input--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-surface);
}

.app-input--disabled:focus {
  border-color: var(--color-border);
  box-shadow: none;
}
</style>