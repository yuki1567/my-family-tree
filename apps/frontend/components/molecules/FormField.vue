<template>
  <div class="form-field">
    <label class="form-label">
      {{ label }}
      <span v-if="required" class="required-marker">*</span>
    </label>
    <AppInput 
      :model-value="modelValue ?? ''"
      :type="type ?? 'text'"
      :placeholder="placeholder ?? ''"
      :disabled="disabled ?? false"
      :required="required ?? false"
      :error="error ?? ''"
      @update:model-value="handleInput"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import type { FormFieldProps } from '@/types/components'
import AppInput from '@/components/atoms/AppInput.vue'

const props = withDefaults(defineProps<FormFieldProps>(), {
  type: 'text',
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (value: string): void => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.required-marker {
  color: #EF4444;
  margin-left: 0.125rem;
}

.error-message {
  font-size: 0.75rem;
  color: #EF4444;
  margin-top: 0.125rem;
}
</style>