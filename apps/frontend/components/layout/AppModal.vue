<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <div ref="modalTarget" class="modal-container">
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
}

.modal-container {
  background-color: var(--color-background);
  border-radius: 0.8rem;
  max-width: 50rem;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-body {
  padding: 3rem 2.4rem;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 0rem 2.4rem 2.4rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.2rem;
}

.modal-footer:empty {
  display: none;
}
</style>
