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

    // アイコンの存在確認
    const icon = wrapper.find('.empty-icon')
    expect(icon.exists()).toBe(true)
    expect(icon.text()).toBe('🌳')

    // タイトルの存在確認
    const title = wrapper.find('.empty-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('家系図を作成しましょう')

    // 説明文の存在確認
    const description = wrapper.find('.empty-description')
    expect(description.exists()).toBe(true)
    expect(description.text()).toContain('右下の「+」ボタンから最初の人物を追加して')

    // CTAボタンの存在確認
    const ctaButton = wrapper.find('.cta-button')
    expect(ctaButton.exists()).toBe(true)
    expect(ctaButton.text()).toBe('最初の人物を追加')
  })

  it('CTAボタンクリック時にstartGuideイベントが発行されるか', async () => {
    const wrapper = mount(EmptyState)
    const ctaButton = wrapper.find('.cta-button')

    await ctaButton.trigger('click')

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
    expect(wrapper.find('.empty-icon').exists()).toBe(true)
    expect(wrapper.find('.empty-title').exists()).toBe(true)
    expect(wrapper.find('.empty-description').exists()).toBe(true)
    expect(wrapper.find('.cta-button').exists()).toBe(true)
  })

  it('レスポンシブ対応のCSS構造が正しいか', () => {
    const wrapper = mount(EmptyState)
    const emptyState = wrapper.find('.empty-state')

    // CSS構造の基本的な確認（実際のスタイル適用は統合テストで確認）
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.classes()).toContain('empty-state')
  })
})