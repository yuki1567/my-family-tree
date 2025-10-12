<template>
  <div class="page-container">
    <!-- メインコンテンツエリア -->
    <div class="content-area">
      <!-- 家系図表示エリア -->
      <main class="family-tree-area">
        <div class="tree-container">
          <!-- 人物データがある場合：人物カード表示 -->
          <PersonCard v-if="hasPersonData" :person="personData" />

          <!-- 人物データがない場合：空状態プレースホルダー -->
          <EmptyState v-else @start-guide="openAddPersonModal" />
        </div>
      </main>
    </div>

    <PersonAddModal
      v-if="showAddPersonModal"
      :error="error"
      @close="closeAddPersonModal"
      @save="savePerson"
    />
  </div>
</template>

<script setup lang="ts">
import EmptyState from '@/components/molecules/EmptyState.vue'
import PersonCard from '@/components/molecules/PersonCard.vue'
import PersonAddModal from '@/components/organisms/PersonAddModal.vue'
import { usePersonApi } from '@/composables/usePersonApi'
import type { Person, PersonForm } from '@/types/person'
import type { ErrorResponse } from '@shared/api/common'
import { computed, ref } from 'vue'

const personData = ref<Person>()
const hasPersonData = computed(() => personData.value)

const { createPerson } = usePersonApi()

const showAddPersonModal = ref(false)
const error = ref<ErrorResponse | undefined>(undefined)

const openAddPersonModal = () => {
  error.value = undefined
  showAddPersonModal.value = true
}

const closeAddPersonModal = () => {
  error.value = undefined
  showAddPersonModal.value = false
}

const savePerson = async (formData: PersonForm): Promise<void> => {
  error.value = undefined

  const result = await createPerson(formData)

  if ('data' in result) {
    personData.value = result.data
    showAddPersonModal.value = false
  } else {
    error.value = result.error
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
  height: 100vh;
}

.tree-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.2rem;
}
</style>
