<template>
  <div class="empty-state">
    <div class="person-placeholder" @click="handleStartGuide">
      <UserIcon class="person-icon" />
    </div>
    <p class="click-hint">クリックして人物を追加</p>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.person-placeholder {
  position: relative;
  width: 120px;
  height: 120px;
  border: 2px dashed var(--color-border);
  border-radius: 50%;
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px auto;
  border-color: var(--color-unknown);
  background: rgba(156, 163, 175, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--color-surface);
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
  transition: color 0.3s ease;
  z-index: 2;
  position: relative;
}

.person-placeholder:hover .person-icon {
  color: var(--color-primary);
}

/* パルスアニメーション */
.pulse-animation::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  opacity: 0;
  animation: pulse 2s infinite;
}

.pulse-ring {
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  border: 1px solid var(--color-primary);
  border-radius: 50%;
  opacity: 0;
  animation: pulse 2s infinite 1s;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* クリックヒントテキスト */
.click-hint {
  color: var(--color-text-secondary);
  font-size: 1.4rem;
  margin: 0;
  animation: fade-in-out 3s infinite;
}

@keyframes fade-in-out {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .empty-state {
    min-height: 300px;
  }

  .person-placeholder {
    width: 100px;
    height: 100px;
    margin-bottom: 1.2rem;
  }

  .person-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
