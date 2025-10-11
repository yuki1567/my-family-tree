<template>
  <div class="page-container">
    <!-- メインコンテンツエリア -->
    <div class="content-area">
      <!-- 家系図表示エリア -->
      <main class="family-tree-area">
        <div class="tree-container">
          <!-- 人物データがある場合：人物カード表示 -->
          <PersonCard v-if="hasPersonData" :person="defaultPerson" />

          <!-- 人物データがない場合：空状態プレースホルダー -->
          <EmptyState v-else @start-guide="openAddPersonModal" />
        </div>
      </main>
    </div>

    <PersonAddModal
      v-if="showAddPersonModal"
      @close="showAddPersonModal = false"
      @save="handlePersonSave"
    />
  </div>
</template>

<script setup lang="ts">
import EmptyState from '@/components/molecules/EmptyState.vue'
import PersonCard from '@/components/molecules/PersonCard.vue'
import PersonAddModal from '@/components/organisms/PersonAddModal.vue'
import { useApi } from '@/composables/useApi'
import type { PersonForm } from '@/types/person'
import type { CreatePersonResponse } from '@shared/api/persons'
import type { Person } from '@shared/types/person'
import { computed, ref } from 'vue'

const personData = ref<Person[]>([])
const hasPersonData = computed(() => personData.value.length > 0)

const defaultPerson = computed(
  (): Person => ({
    id: 'default-person-1',
    name: '田中 太郎',
    gender: 'male',
    birthDate: '1990-04-15',
    birthPlace: '東京都',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
)

const showAddPersonModal = ref(false)

const openAddPersonModal = () => {
  showAddPersonModal.value = true
}

const convertGenderToNumber = (
  gender: 'male' | 'female' | 'unknown' | undefined
): 0 | 1 | 2 | undefined => {
  if (gender === 'male') return 1
  if (gender === 'female') return 2
  if (gender === 'unknown') return 0
  return undefined
}

const handlePersonSave = async (formData: PersonForm): Promise<void> => {
  try {
    const requestBody = {
      ...formData,
      gender: convertGenderToNumber(formData.gender),
    }

    const response = await useApi<CreatePersonResponse['data']>(
      '/api/people',
      {
        method: 'POST',
        body: requestBody,
      }
    )

    if ('error' in response) {
      console.error('API Error:', response.error)
      return
    }

    if ('data' in response) {
      const newPerson: Person = {
        id: response.data.id,
        name: response.data.name,
        gender:
          response.data.gender === 1
            ? 'male'
            : response.data.gender === 2
              ? 'female'
              : 'unknown',
        birthDate: response.data.birthDate,
        deathDate: response.data.deathDate,
        birthPlace: response.data.birthPlace,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      personData.value.push(newPerson)
      showAddPersonModal.value = false
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}
</script>

<style scoped>
/* ページコンテナ */
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

/* メインコンテンツエリア */
.content-area {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 家系図表示エリア */
.family-tree-area {
  flex: 1;
  background-color: var(--color-bg-secondary);
  padding: 1.6rem;
  overflow: auto;
  /* 背景を画面の一番下まで拡張 */
  min-height: 100vh;
}

.tree-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.2rem;
}

.tree-placeholder {
  text-align: center;
  padding: 3.2rem;
  border: 2px dashed var(--color-border-primary);
  border-radius: 0.6rem;
  background-color: var(--color-bg-secondary);
}

.tree-placeholder h2 {
  margin: 0 0 0.8rem 0;
  color: var(--color-text-primary);
}

.tree-placeholder p {
  margin: 0;
  color: var(--color-text-secondary);
}

/* コントロールパネル */
.control-panel {
  flex: 0 0 200px;
  background-color: var(--color-bg-secondary);
  border-left: 1px solid var(--color-border-primary);
  padding: 1.6rem;
  overflow-y: auto;
}

.control-group {
  margin-bottom: 2.4rem;
}

.control-group h3 {
  margin: 0 0 0.8rem 0;
  font-size: 1.6rem;
  color: var(--color-text-primary);
  font-weight: 600;
}

.control-btn {
  display: block;
  width: 100%;
  margin-bottom: 0.8rem;
  padding: 0.8rem;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 1.6rem;
}

.control-btn:hover {
  background-color: var(--color-border-primary);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .content-area {
    flex-direction: column;
  }

  .control-panel {
    flex: 0 0 auto;
    border-left: none;
    border-top: 1px solid var(--color-border-primary);
    padding: 0.75rem;
  }

  .control-group {
    display: inline-block;
    margin-right: 1rem;
    margin-bottom: 0.5rem;
  }

  .control-btn {
    display: inline-block;
    width: auto;
    margin-right: 0.5rem;
    margin-bottom: 0.25rem;
    padding: 0.375rem 0.75rem;
  }
}
</style>
