<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <div
        ref="modalTarget"
        class="modal-container"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <div class="modal-body">
          <slot />
        </div>

        <div class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

type Emits = {
  close: []
}

const emit = defineEmits<Emits>()

const modalTarget = ref<HTMLElement>()

const { activate, deactivate } = useFocusTrap(modalTarget, {
  escapeDeactivates: true,
  clickOutsideDeactivates: true,
  returnFocusOnDeactivate: true,
  initialFocus: () => modalTarget.value!,
  fallbackFocus: () => modalTarget.value!,
  onDeactivate: () => emit('close'),
})

onMounted(async () => {
  await nextTick()
  activate()
})

onUnmounted(() => {
  deactivate()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.6rem;
}

.modal-container {
  background-color: var(--color-background);
  border-radius: 0.8rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 50rem;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-body {
  padding: 2.4rem;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 1.6rem 2.4rem 2rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.2rem;
}

.modal-footer:empty {
  display: none;
}

/* レスポンシブ対応（768px未満はフルスクリーン） */
@media (max-width: 767px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-container {
    max-width: 100vw;
    width: 100vw;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .modal-body {
    flex: 1;
  }
}

/* フォーカス時のアクセシビリティ対応 */
.modal-container:focus {
  outline: none;
}

/* アニメーション */
.modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  animation: slideIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-2rem) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
