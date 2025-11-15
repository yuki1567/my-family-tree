<template>
  <div class="person-card-wrapper">
    <div class="person-card">
      <div class="person-avatar" :class="genderClass">
        <UserIcon class="person-icon" />
      </div>
      <h3 class="person-name">
        {{ person.name || '名前未設定' }}
      </h3>
      <div class="person-details">
        <p v-if="person.birthDate" class="person-birth">
          生年月日: {{ formatDate(person.birthDate) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Person } from '@/types/person'
import { UserIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'

type Props = {
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
.person-card-wrapper {
  min-height: 400px;
}

.person-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.6rem 0rem;
  background-color: var(--color-bg-primary);
  border: 2px solid var(--color-border-primary);
  border-radius: 0.8rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100px;
  transition: all 0.3s ease;
}

.person-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--color-primary);
}

.person-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.person-avatar--male {
  background-color: var(--color-gender-male);
  color: white;
}

.person-avatar--female {
  background-color: var(--color-gender-female);
  color: white;
}

.person-avatar--unknown {
  background-color: var(--color-gender-unknown);
  color: white;
}

.person-icon {
  width: 24px;
  height: 24px;
}

.person-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
  text-align: center;
}

.person-details {
  text-align: center;
  width: 100%;
}

.person-details p {
  margin: 0.4rem 0;
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.person-birth {
  font-weight: 500;
}

.person-memo {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .person-card {
    padding: 1.2rem 0rem;
    width: 90px;
  }

  .person-avatar {
    width: 40px;
    height: 40px;
    margin-bottom: 8px;
  }

  .person-icon {
    width: 20px;
    height: 20px;
  }

  .person-name {
    font-size: 1.2rem;
    margin-bottom: 3px;
  }

  .person-details p {
    font-size: 1rem;
  }
}
</style>
