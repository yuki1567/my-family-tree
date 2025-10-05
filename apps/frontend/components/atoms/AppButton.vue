<template>
  <button
    :type="type"
    :disabled="isDisabled || isLoading"
    :class="buttonClasses"
    :style="buttonStyles"
    @click="handleClick"
  >
    <span v-if="!isLoading" class="button-contents">
      <slot />
    </span>
    <ArrowPathIcon v-else class="loading-icon" />
  </button>
</template>

<script setup lang="ts">
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'

type Props = {
  variant?: 'primary' | 'secondary' | 'danger'
  width?: number
  type?: 'button' | 'submit'
  isDisabled?: boolean
  isLoading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  isDisabled: false,
  isLoading: false,
  fullWidth: false,
})

type Emits = {
  click: [event: MouseEvent]
}

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'app-button',
  `app-button-${props.variant}`,
  {
    'app-button-loading': props.isLoading,
    'app-button-full-width': props.fullWidth,
  },
])

const buttonStyles = computed(() => ({
  ...(props.width && { width: `${props.width}rem` }),
}))

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
  border-radius: 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding: 0.5rem 1rem;
  font-size: 1.4rem;
}

.button-contents {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

/* Variants */
.app-button-primary {
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
  border: 1px solid var(--button-primary-border);
}

.app-button-primary:hover:not(:disabled) {
  background-color: var(--button-primary-bg-hover);
  color: var(--button-primary-text-hover);
}

.app-button-secondary {
  background-color: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  border: 1px solid var(--button-secondary-border);
}

.app-button-secondary:hover:not(:disabled) {
  background-color: var(--button-secondary-bg-hover);
  border-color: var(--button-secondary-border-hover);
  color: var(--button-secondary-text-hover);
}

.app-button-danger {
  background-color: var(--button-danger-bg);
  color: var(--button-danger-text);
  border: 1px solid var(--button-danger-border);
}

.app-button-danger:hover:not(:disabled) {
  background-color: var(--button-danger-bg-hover);
  color: var(--button-danger-text-hover);
}

/* States */
.app-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.app-button-loading {
  background-color: var(--button-loading-bg);
  color: var(--button-loading-text);
  cursor: not-allowed;
}

.loading-icon {
  width: 1.4rem;
  height: 1.4rem;
  animation: spin 1s linear infinite;
}

@media (max-width: 767px) {
  .app-button-full-width {
    width: 100%;
  }
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
