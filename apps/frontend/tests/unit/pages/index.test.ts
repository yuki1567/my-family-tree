import IndexPage from '@/pages/index.vue'
import EmptyState from '@/components/molecules/EmptyState.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

// アラートのモック化
global.alert = vi.fn()

describe('index.vue', () => {
  it('正常にマウントできるか', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          EmptyState: true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('ヘッダーが正しく表示されているか', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          EmptyState: true,
        },
      },
    })

    const header = wrapper.find('.app-header')
    expect(header.exists()).toBe(true)

    const title = wrapper.find('.app-title')
    expect(title.text()).toBe('Family Tree App')

    const settingsBtn = wrapper.find('.settings-btn')
    expect(settingsBtn.text()).toBe('設定')
  })

  it('人物データが空の場合EmptyStateが表示されるか', () => {
    const wrapper = mount(IndexPage)

    // EmptyStateコンポーネントが存在するか
    const emptyState = wrapper.findComponent(EmptyState)
    expect(emptyState.exists()).toBe(true)
  })

  it('フローティングボタンが存在し、クリック時に適切に動作するか', async () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          EmptyState: true,
        },
      },
    })

    const floatingBtn = wrapper.find('.floating-add-btn')
    expect(floatingBtn.exists()).toBe(true)
    expect(floatingBtn.text()).toBe('+')

    // ボタンクリック
    await floatingBtn.trigger('click')

    // アラートが呼ばれたかチェック
    expect(global.alert).toHaveBeenCalledWith(
      '人物追加機能は今後実装予定です。\n現在は空状態デザインの確認ができます。'
    )
  })

  it('EmptyStateからstartGuideイベントを受け取ったときに適切に処理されるか', async () => {
    const wrapper = mount(IndexPage)
    const emptyState = wrapper.findComponent(EmptyState)

    // startGuideイベントを発行
    await emptyState.vm.$emit('startGuide')

    // アラートが呼ばれたかチェック
    expect(global.alert).toHaveBeenCalledWith(
      '人物追加機能は今後実装予定です。\n現在は空状態デザインの確認ができます。'
    )
  })

  it('hasPersonDataの計算プロパティが正しく動作するか', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          EmptyState: true,
        },
      },
    })

    // 現在は空データなので false を期待
    const vm = wrapper.vm as any
    expect(vm.hasPersonData).toBe(false)
    expect(vm.personData).toEqual([])
  })

  it('レスポンシブ対応のCSS構造が適用されているか', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          EmptyState: true,
        },
      },
    })

    // 主要なレスポンシブ要素の存在確認
    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.find('.content-area').exists()).toBe(true)
    expect(wrapper.find('.family-tree-area').exists()).toBe(true)
    expect(wrapper.find('.floating-add-btn').exists()).toBe(true)
  })
})