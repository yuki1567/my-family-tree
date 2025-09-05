<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- 写真表示エリア -->
    <div class="person-photo">
      <img 
        v-if="person.photo" 
        :src="person.photo" 
        :alt="`${person.name || 'Unknown'}の写真`"
        class="photo-image"
      />
      <div v-else class="photo-placeholder">
        <span class="photo-icon">👤</span>
      </div>
    </div>
    
    <!-- 人物情報 -->
    <div class="person-info">
      <h3 class="person-name">{{ person.name || '名前未設定' }}</h3>
      <div class="person-details">
        <span v-if="person.birthDate || person.deathDate" class="life-span">
          {{ formatLifeSpan }}
        </span>
        <span v-if="person.birthPlace" class="birth-place">
          📍 {{ person.birthPlace }}
        </span>
      </div>
    </div>
    
    <!-- 性別インジケーター -->
    <div :class="genderIndicatorClasses"></div>
    
    <!-- クリック可能時のアイコン -->
    <div v-if="clickable" class="click-indicator">
      ›
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PersonCardProps, Person } from '@/types/components'

const props = withDefaults(defineProps<PersonCardProps>(), {
  clickable: false
})

const emit = defineEmits<{
  click: [person: Person]
}>()

const cardClasses = computed(() => [
  'person-card',
  `person-card--${props.person.gender || 'unknown'}`,
  {
    'person-card--clickable': props.clickable
  }
])

const genderIndicatorClasses = computed(() => [
  'gender-indicator',
  `gender-indicator--${props.person.gender || 'unknown'}`
])

const formatLifeSpan = computed(() => {
  const birth = props.person.birthDate
  const death = props.person.deathDate
  
  if (birth && death) {
    return `${formatDate(birth)} - ${formatDate(death)}`
  } else if (birth) {
    return `${formatDate(birth)} -`
  } else if (death) {
    return `- ${formatDate(death)}`
  }
  return ''
})

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.getFullYear().toString()
  } catch {
    return dateString
  }
}

const handleClick = (): void => {
  if (props.clickable) {
    emit('click', props.person)
  }
}
</script>

<style scoped>
.person-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: var(--node-width);
  min-height: var(--node-height);
  background-color: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.person-card--clickable {
  cursor: pointer;
}

.person-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 性別による境界線色 */
.person-card--male {
  border-color: var(--color-male);
}

.person-card--female {
  border-color: var(--color-female);
}

.person-card--unknown {
  border-color: var(--color-unknown);
}

/* 写真エリア */
.person-photo {
  width: 40px;
  height: 40px;
  margin: 0 auto 0.5rem;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
}

.photo-icon {
  font-size: 1.25rem;
}

/* 人物情報 */
.person-info {
  flex: 1;
  text-align: center;
}

.person-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.person-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.life-span,
.birth-place {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  line-height: 1.1;
}

.birth-place {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 性別インジケーター */
.gender-indicator {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.gender-indicator--male {
  background-color: var(--color-male);
}

.gender-indicator--female {
  background-color: var(--color-female);
}

.gender-indicator--unknown {
  background-color: var(--color-unknown);
}

/* クリック可能インジケーター */
.click-indicator {
  position: absolute;
  top: 50%;
  right: 0.25rem;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--color-text-secondary);
  font-weight: bold;
}

.person-card--clickable:hover .click-indicator {
  color: var(--color-primary);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .person-card {
    width: calc(var(--node-width) * 0.9);
    min-height: calc(var(--node-height) * 0.9);
    padding: 0.5rem;
  }
  
  .person-photo {
    width: 32px;
    height: 32px;
  }
  
  .person-name {
    font-size: 0.8rem;
  }
  
  .life-span,
  .birth-place {
    font-size: 0.65rem;
  }
}
</style>