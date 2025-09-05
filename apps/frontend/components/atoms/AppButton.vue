<template>
  <button 
    :type="type ?? 'button'" 
    :class="buttonClasses"
    :disabled="disabled ?? false"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppButtonProps } from '@/types/components'

const props = withDefaults(defineProps<AppButtonProps>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'app-button',
  `app-button--${props.variant}`,
  `app-button--${props.size}`,
  {
    'app-button--disabled': props.disabled
  }
])

const handleClick = (event: MouseEvent): void => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.app-button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Variant styles */
.app-button--primary {
  background-color: var(--color-primary);
  color: white;
}

.app-button--primary:hover:not(.app-button--disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.app-button--secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.app-button--secondary:hover:not(.app-button--disabled) {
  background-color: var(--color-border);
}

.app-button--danger {
  background-color: #EF4444;
  color: white;
}

.app-button--danger:hover:not(.app-button--disabled) {
  background-color: #DC2626;
}

/* Size styles */
.app-button--small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25;
}

.app-button--medium {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.app-button--large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

/* Disabled state */
.app-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}
</style>