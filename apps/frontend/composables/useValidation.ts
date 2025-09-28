import { ref, reactive, watch } from 'vue'
import type { PersonForm, ValidationErrors } from '@/types/person'

/**
 * PersonFormバリデーション用Composable
 */
export function usePersonValidation(form: PersonForm) {
  const errors = reactive<ValidationErrors>({})
  const isValid = ref(true)

  /**
   * 特定フィールドのバリデーション実行
   */
  const validateField = (field: keyof PersonForm, value: string | undefined): void => {
    // エラーをクリア
    errors[field] = undefined

    if (!value || value === '') {
      updateValidationState()
      return
    }

    switch (field) {
      case 'name':
        validateName(value)
        break
      case 'birthDate':
        validateBirthDate(value)
        break
      case 'deathDate':
        validateDeathDate(value)
        break
      case 'birthPlace':
        validateBirthPlace(value)
        break
    }

    updateValidationState()
  }

  /**
   * フォーム全体のバリデーション実行
   */
  const validateForm = (): boolean => {
    // 全エラーをクリア
    Object.keys(errors).forEach((key) => {
      errors[key as keyof ValidationErrors] = undefined
    })

    // 各フィールドをバリデーション
    if (form.name) validateName(form.name)
    if (form.birthDate) validateBirthDate(form.birthDate)
    if (form.deathDate) validateDeathDate(form.deathDate)
    if (form.birthPlace) validateBirthPlace(form.birthPlace)

    // 生年月日と没年月日の関係をチェック
    validateDateRelation()

    updateValidationState()
    return isValid.value
  }

  /**
   * 氏名バリデーション
   */
  const validateName = (name: string): void => {
    if (name.length > 100) {
      errors.name = '氏名は100文字以内で入力してください'
    }
  }

  /**
   * 生年月日バリデーション
   */
  const validateBirthDate = (birthDate: string): void => {
    const date = new Date(birthDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date > today) {
      errors.birthDate = '生年月日に未来の日付は入力できません'
    }

    // 1800年より前の日付をチェック
    const minDate = new Date('1800-01-01')
    if (date < minDate) {
      errors.birthDate = '1800年以降の日付を入力してください'
    }
  }

  /**
   * 没年月日バリデーション
   */
  const validateDeathDate = (deathDate: string): void => {
    const date = new Date(deathDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date > today) {
      errors.deathDate = '没年月日に未来の日付は入力できません'
    }

    // 1800年より前の日付をチェック
    const minDate = new Date('1800-01-01')
    if (date < minDate) {
      errors.deathDate = '1800年以降の日付を入力してください'
    }
  }

  /**
   * 出生地バリデーション
   */
  const validateBirthPlace = (birthPlace: string): void => {
    if (birthPlace.length > 200) {
      errors.birthPlace = '出生地は200文字以内で入力してください'
    }
  }


  /**
   * 生年月日と没年月日の関係をバリデーション
   */
  const validateDateRelation = (): void => {
    if (form.birthDate && form.deathDate) {
      const birthDate = new Date(form.birthDate)
      const deathDate = new Date(form.deathDate)

      if (birthDate >= deathDate) {
        errors.deathDate = '没年月日は生年月日より後の日付を入力してください'
      }
    }
  }

  /**
   * バリデーション状態の更新
   */
  const updateValidationState = (): void => {
    isValid.value = Object.keys(errors).length === 0
  }

  /**
   * エラーをクリア
   */
  const clearErrors = (): void => {
    Object.keys(errors).forEach((key) => {
      errors[key as keyof ValidationErrors] = undefined
    })
    updateValidationState()
  }

  /**
   * 特定フィールドのエラーをクリア
   */
  const clearFieldError = (field: keyof PersonForm): void => {
    errors[field] = undefined
    updateValidationState()
  }

  // リアルタイムバリデーション用ウォッチャー
  watch(() => form.name, (newValue) => {
    if (newValue !== undefined) {
      validateField('name', newValue)
    }
  })

  watch(() => form.birthDate, (newValue) => {
    if (newValue !== undefined) {
      validateField('birthDate', newValue)
      // 生年月日変更時は没年月日との関係もチェック
      if (form.deathDate) {
        validateDateRelation()
        updateValidationState()
      }
    }
  })

  watch(() => form.deathDate, (newValue) => {
    if (newValue !== undefined) {
      validateField('deathDate', newValue)
      // 没年月日変更時は生年月日との関係もチェック
      if (form.birthDate) {
        validateDateRelation()
        updateValidationState()
      }
    }
  })

  watch(() => form.birthPlace, (newValue) => {
    if (newValue !== undefined) {
      validateField('birthPlace', newValue)
    }
  })


  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
  }
}
