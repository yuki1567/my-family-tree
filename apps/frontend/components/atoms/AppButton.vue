<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner" />
    <span :class="{ 'content-hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  disabled: false,
  loading: false,
})

type Emits = {
  click: [event: MouseEvent]
}

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'app-button',
  `app-button--${props.variant}`,
  `app-button--${props.size}`,
  {
    'app-button--disabled': props.disabled,
    'app-button--loading': props.loading,
  },
])

const handleClick = (event: MouseEvent): void => {
  if (!props.disabled && !props.loading) {
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
}

/* Variants */
.app-button--primary {
  background-color: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
}

.app-button--primary:hover:not(:disabled) {
  background-color: #ea580c;
  border-color: #ea580c;
}

.app-button--secondary {
  background-color: var(--color-background);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.app-button--secondary:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: var(--color-background);
}

.app-button--danger {
  background-color: #ef4444;
  color: white;
  border: 1px solid #ef4444;
}

.app-button--danger:hover:not(:disabled) {
  background-color: #dc2626;
  border-color: #dc2626;
}

/* Sizes */
.app-button--small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.app-button--medium {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.app-button--large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
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
