<template>
  <div class="empty-state">
    <div class="empty-icon">🌳</div>
    <h2 class="empty-title">家系図を作成しましょう</h2>
    <p class="empty-description">
      右下の「+」ボタンから最初の人物を追加して、<br>
      あなただけの家系図を作成してください。
    </p>
    <button class="cta-button" @click="handleStartGuide">
      最初の人物を追加
    </button>
  </div>
</template>

<script setup lang="ts">
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  height: 100%;
  min-height: 400px;
}

.empty-icon {
  font-size: 6rem;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.empty-title {
  color: var(--color-text);
  font-size: 2.4rem;
  font-weight: 600;
  margin: 0 0 1.6rem 0;
  line-height: 1.3;
}

.empty-description {
  color: var(--color-text-secondary);
  font-size: 1.6rem;
  line-height: 1.6;
  margin: 0 0 3.2rem 0;
  max-width: 40rem;
}

.cta-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.8rem;
  padding: 1.2rem 2.4rem;
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.cta-button:hover {
  background-color: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.cta-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .empty-state {
    padding: 3rem 1.6rem;
    min-height: 300px;
  }

  .empty-icon {
    font-size: 4.8rem;
    margin-bottom: 1.6rem;
  }

  .empty-title {
    font-size: 2rem;
    margin-bottom: 1.2rem;
  }

  .empty-description {
    font-size: 1.4rem;
    margin-bottom: 2.4rem;
  }

  .cta-button {
    padding: 1rem 2rem;
    font-size: 1.4rem;
  }
}
</style>