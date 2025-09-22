<template>
  <button
    :type="type"
    :disabled="isDisabled || isLoading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="isLoading" class="loading-spinner" />
    <span :class="{ 'content-hidden': isLoading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit'
  isDisabled?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  isDisabled: false,
  isLoading: true,
})

type Emits = {
  click: [event: MouseEvent]
}

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'app-button',
  `app-button--${props.variant}`,
  {
    'app-button--disabled': props.isDisabled,
    'app-button--loading': props.isLoading,
  },
])

const handleClick = (event: MouseEvent): void => {
  if (!props.isDisabled && !props.isLoading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.app-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Variants */
.app-button--primary {
  background-color: var(--color-background);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.app-button--primary:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: var(--color-background);
}

.app-button--secondary {
  background-color: white;
  background-color: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.app-button--secondary:hover:not(:disabled) {
  background-color: #eceff1;
  border-color: #d1d5db;
  color: #505966;
}

.app-button--danger {
  background-color: var(--color-background);
  color: #ef4444;
  border: 1px solid #ef4444;
}

.app-button--danger:hover:not(:disabled) {
  background-color: #ef4444;
  color: var(--color-background);
}

/* States */
.app-button--disabled,
.app-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.app-button--loading {
  cursor: wait;
}

.loading-spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.content-hidden {
  opacity: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
