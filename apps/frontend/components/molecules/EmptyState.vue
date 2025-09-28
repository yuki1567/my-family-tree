<template>
  <div class="empty-state">
    <div
      class="person-card"
      @click="handleStartGuide"
    >
      <div class="avatar unknown">
        <UserIcon class="avatar-icon" />
      </div>
      <div class="person-info">
        <div class="person-name">
          人物を追加
        </div>
        <div class="person-dates">
          クリック
        </div>
      </div>
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
  min-height: 400px;
}

/* 人物カード */
.person-card {
  background: var(--color-background);
  border: 2px dashed var(--color-border);
  border-radius: 0.8rem;
  padding: 1.6rem 0rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.person-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--color-primary);
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px auto;
  border-color: var(--color-unknown);
  background: rgba(156, 163, 175, 0.1);
}

.avatar-icon {
  width: 24px;
  height: 24px;
  fill: var(--color-text-secondary);
  stroke: var(--color-text-seconfary);
}

.person-name {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.person-dates {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
}
</style>
