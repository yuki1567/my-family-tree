<template>
  <div class="empty-state">
    <div class="person-placeholder" @click="handleStartGuide">
      <UserIcon class="person-icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  startGuide: []
}>()

const handleStartGuide = () => {
  emit('startGuide')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.person-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--color-surface);
}

.person-placeholder:hover {
  border-color: var(--color-primary);
  background-color: rgba(249, 115, 22, 0.05);
  transform: scale(1.05);
}

.person-placeholder:active {
  transform: scale(0.95);
}

.person-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.person-placeholder:hover .person-icon {
  color: var(--color-primary);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .empty-state {
    min-height: 300px;
  }

  .person-placeholder {
    width: 100px;
    height: 100px;
  }

  .person-icon {
    width: 40px;
    height: 40px;
  }
}
</style>