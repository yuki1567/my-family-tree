<template>
  <button
    :type="type"
    :disabled="isDisabled || isLoading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <template v-if="isLoading">
      <span class="loading-spinner" />
      <span class="loading-text">読み込み中...</span>
    </template>
    <template v-else>
      <slot />
    </template>
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
  isLoading: false,
})

type Emits = {
  click: [event: MouseEvent]
}

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'app-button',
  `app-button--${props.variant}`,
  {
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding: 0.6rem 1.2rem;
  font-size: 1.4rem;
  min-width: fit-content;
  white-space: nowrap;
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
.app-button:disabled {
  opacity: 0.6;
  color: #6b7280;
  border: 1px solid #6b7280;
  cursor: not-allowed;
}

.app-button--loading {
  cursor: wait;
}

.loading-spinner {
  width: 1.4rem;
  height: 1.4rem;
  border: 0.2rem solid transparent;
  border-top: 0.2rem solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
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
