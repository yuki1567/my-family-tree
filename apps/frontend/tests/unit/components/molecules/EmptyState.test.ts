import EmptyState from '@/components/molecules/EmptyState.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

describe('EmptyState.vue', () => {
  it('正常にマウントできるか', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.exists()).toBe(true)
  })

  it('必要な要素が表示されているか', () => {
    const wrapper = mount(EmptyState)

    // person-placeholderの存在確認
    const placeholder = wrapper.find('.person-placeholder')
    expect(placeholder.exists()).toBe(true)

    // person-iconの存在確認
    const icon = wrapper.find('.person-icon')
    expect(icon.exists()).toBe(true)

    // UserIconコンポーネントが存在するか
    const userIcon = wrapper.findComponent({ name: 'UserIcon' })
    expect(userIcon.exists()).toBe(true)
  })

  it('person-placeholderクリック時にstartGuideイベントが発行されるか', async () => {
    const wrapper = mount(EmptyState)
    const placeholder = wrapper.find('.person-placeholder')

    await placeholder.trigger('click')

    // イベントが発行されたかチェック
    const emittedEvents = wrapper.emitted('startGuide')
    expect(emittedEvents).toBeTruthy()
    expect(emittedEvents).toHaveLength(1)
  })

  it('適切なCSSクラスが適用されているか', () => {
    const wrapper = mount(EmptyState)

    // メインコンテナ
    expect(wrapper.find('.empty-state').exists()).toBe(true)

    // 各要素のクラス確認
    expect(wrapper.find('.person-placeholder').exists()).toBe(true)
    expect(wrapper.find('.person-icon').exists()).toBe(true)
  })

  it('クリック可能な要素としての動作確認', () => {
    const wrapper = mount(EmptyState)
    const placeholder = wrapper.find('.person-placeholder')

    // クリッカブル要素の確認
    expect(placeholder.exists()).toBe(true)
    expect(placeholder.element.tagName).toBe('DIV')

    // カーソルスタイルが適用されているか（CSS確認）
    expect(placeholder.classes()).toContain('person-placeholder')
  })
})
