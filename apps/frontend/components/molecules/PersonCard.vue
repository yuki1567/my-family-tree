<template>
  <div class="person-card">
    <div
      class="person-avatar"
      :class="genderClass"
    >
      <UserIcon class="person-icon" />
    </div>
    <h3 class="person-name">
      {{ person.name || '名前未設定' }}
    </h3>
    <div class="person-details">
      <p
        v-if="person.birthDate"
        class="person-birth"
      >
        生年月日: {{ formatDate(person.birthDate) }}
      </p>
      <p
        v-if="person.birthPlace"
        class="person-place"
      >
        出生地: {{ person.birthPlace }}
      </p>
      <p
        v-if="person.memo"
        class="person-memo"
      >
        {{ person.memo }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import type { Person } from '~/../../shared/types/person'

interface Props {
  person: Person
}

const props = defineProps<Props>()

const genderClass = computed(() => {
  switch (props.person.gender) {
    case 'male':
      return 'person-avatar--male'
    case 'female':
      return 'person-avatar--female'
    default:
      return 'person-avatar--unknown'
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.person-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.4rem;
  background-color: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 280px;
  transition: all 0.3s ease;
}

.person-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--color-primary);
}

.person-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.6rem;
  transition: all 0.3s ease;
}

.person-avatar--male {
  background-color: var(--color-male);
  color: white;
}

.person-avatar--female {
  background-color: var(--color-female);
  color: white;
}

.person-avatar--unknown {
  background-color: var(--color-unknown);
  color: white;
}

.person-icon {
  width: 40px;
  height: 40px;
}

.person-name {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1.2rem 0;
  text-align: center;
}

.person-details {
  text-align: center;
  width: 100%;
}

.person-details p {
  margin: 0.4rem 0;
  font-size: 1.4rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.person-birth {
  font-weight: 500;
}

.person-place {
  font-style: italic;
}

.person-memo {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--color-border);
  color: var(--color-text);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .person-card {
    padding: 1.6rem;
    max-width: 240px;
  }

  .person-avatar {
    width: 64px;
    height: 64px;
    margin-bottom: 1.2rem;
  }

  .person-icon {
    width: 32px;
    height: 32px;
  }

  .person-name {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  .person-details p {
    font-size: 1.2rem;
  }
}
</style>
