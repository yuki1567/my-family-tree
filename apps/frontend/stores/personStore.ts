import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PersonForm } from '@/types/person'

/**
 * 人物データ管理用Store
 */
export const usePersonStore = defineStore('person', () => {
  // 人物リスト
  const people = ref<Person[]>([])

  // ローディング状態
  const isLoading = ref(false)

  // エラー状態
  const error = ref<string | null>(null)

  /**
   * 人物を追加
   */
  const addPerson = async (personData: PersonForm): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // APIエンドポイントにPOSTリクエストを送信
      const response = await $fetch('/api/people', {
        method: 'POST',
        body: personData,
      })

      // 成功時は人物リストに追加
      if (response && typeof response === 'object' && 'id' in response) {
        people.value.push(response as Person)
      }
    }
    catch (err) {
      // エラーハンドリング
      if (err instanceof Error) {
        error.value = err.message
      }
      else {
        error.value = '人物の追加に失敗しました'
      }
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 人物リストを取得
   */
  const fetchPeople = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/people')

      if (Array.isArray(response)) {
        people.value = response
      }
    }
    catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      }
      else {
        error.value = '人物リストの取得に失敗しました'
      }
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * エラーをクリア
   */
  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    people: readonly(people),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Actions
    addPerson,
    fetchPeople,
    clearError,
  }
})

/**
 * 人物の基本型定義（一時的）
 * 将来的には共通の型定義ファイルから import する
 */
interface Person {
  id: string
  name?: string
  gender?: 'male' | 'female'
  birthDate?: string
  deathDate?: string
  birthPlace?: string
  memo?: string
  createdAt: string
  updatedAt: string
}
