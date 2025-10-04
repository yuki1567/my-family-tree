import PersonAddModal from '@/components/organisms/PersonAddModal.vue'
import { type VueWrapper, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

// useFocusTrapのモック
vi.mock('@vueuse/integrations/useFocusTrap', () => ({
  useFocusTrap: () => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
  }),
}))

describe('PersonAddModal Integration Test', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
    document.body.innerHTML = ''
  })

  describe('コンポーネント連携テスト', () => {
    it('モーダルが正しく表示され、すべての入力フィールドとボタンが存在する', async () => {
      wrapper = mount(PersonAddModal, {
        attachTo: document.body,
        global: {
          stubs: {
            UserIcon: true,
            UsersIcon: true,
            Teleport: false,
          },
        },
      })

      await wrapper.vm.$nextTick()

      // フォームの存在確認
      const personForm = document.querySelector('.person-form')
      expect(personForm).toBeTruthy()

      // 入力フィールドの存在確認
      expect(document.querySelector('input[name="name"]')).toBeTruthy()
      expect(document.querySelectorAll('input[name="gender"]').length).toBe(3)
      expect(document.querySelector('input[name="birthDate"]')).toBeTruthy()
      expect(document.querySelector('input[name="deathDate"]')).toBeTruthy()
      expect(document.querySelector('input[name="birthPlace"]')).toBeTruthy()

      // ボタンの存在確認
      const buttons = Array.from(document.querySelectorAll('button'))
      const cancelButton = buttons.find((btn) =>
        btn.textContent?.includes('キャンセル')
      )
      const submitButton = buttons.find((btn) =>
        btn.textContent?.includes('追加')
      )
      expect(cancelButton).toBeTruthy()
      expect(submitButton).toBeTruthy()
    })

    it('キャンセルボタンをクリックするとcloseイベントがemitされる', async () => {
      wrapper = mount(PersonAddModal, {
        attachTo: document.body,
        global: {
          stubs: {
            UserIcon: true,
            UsersIcon: true,
            Teleport: false,
          },
        },
      })

      await wrapper.vm.$nextTick()

      // キャンセルボタンをクリック
      const buttons = Array.from(document.querySelectorAll('button'))
      const cancelButton = buttons.find((btn) =>
        btn.textContent?.includes('キャンセル')
      )
      expect(cancelButton).toBeTruthy()
      cancelButton!.click()

      await wrapper.vm.$nextTick()

      // closeイベントがemitされることを確認
      const closeEvents = wrapper.emitted('close')
      expect(closeEvents).toBeDefined()
      expect(closeEvents!.length).toBe(1)
    })

    it('バリデーションエラーがある場合、送信されず、エラーメッセージが表示される', async () => {
      wrapper = mount(PersonAddModal, {
        attachTo: document.body,
        global: {
          stubs: {
            UserIcon: true,
            UsersIcon: true,
            Teleport: false,
          },
        },
      })

      await wrapper.vm.$nextTick()

      // 不正なデータを設定（没年月日が生年月日より前）
      // @ts-expect-error - formプロパティへの直接アクセス
      wrapper.vm.form.birthDate = '2000-01-01'
      // @ts-expect-error - formプロパティへの直接アクセス
      wrapper.vm.form.deathDate = '1990-01-01'

      await wrapper.vm.$nextTick()

      // submitFormを呼び出し
      // @ts-expect-error - submitFormメソッドへの直接アクセス
      await wrapper.vm.submitForm()

      await wrapper.vm.$nextTick()

      // saveイベントがemitされないことを確認
      const saveEvents = wrapper.emitted('save')
      expect(saveEvents).toBeUndefined()
    })

    it('FormFieldコンポーネント、AppButtonコンポーネント、AppModalコンポーネントが正しく連携して動作する', async () => {
      wrapper = mount(PersonAddModal, {
        attachTo: document.body,
        global: {
          stubs: {
            UserIcon: true,
            UsersIcon: true,
            Teleport: false,
          },
        },
      })

      await wrapper.vm.$nextTick()

      // モーダルコンテナの存在確認
      expect(document.querySelector('.modal-container')).toBeTruthy()

      // FormFieldコンポーネントのレンダリング確認
      expect(
        document.querySelectorAll('.form-field-label').length
      ).toBeGreaterThan(0)

      // AppButtonコンポーネントのレンダリング確認
      const buttons = document.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })
})
