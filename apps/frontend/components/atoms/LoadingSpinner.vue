<template>
  <div :class="spinnerClasses">
    <div class="spinner"></div>
    <span v-if="text" class="spinner-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LoadingSpinnerProps } from '@/types/components'

const props = withDefaults(defineProps<LoadingSpinnerProps>(), {
  size: 'medium'
})

const spinnerClasses = computed(() => [
  'loading-spinner',
  `loading-spinner--${props.size}`
])
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Size variants */
.loading-spinner--small .spinner {
  width: 16px;
  height: 16px;
  border-width: 1px;
}

.loading-spinner--medium .spinner {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.loading-spinner--large .spinner {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.spinner-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.loading-spinner--small .spinner-text {
  font-size: 0.75rem;
}

.loading-spinner--large .spinner-text {
  font-size: 1rem;
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