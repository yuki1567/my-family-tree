import IndexPage from '@/pages/index.vue'
import PersonCard from '@/components/molecules/PersonCard.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

// アラートのモック化
global.alert = vi.fn()

describe('index.vue', () => {
  it('正常にマウントできるか', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          PersonCard: true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('ヘッダーが正しく表示されているか', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          PersonCard: true,
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

  it('デフォルト人物データでPersonCardが表示されるか', () => {
    const wrapper = mount(IndexPage)

    // PersonCardコンポーネントが存在するか
    const personCard = wrapper.findComponent(PersonCard)
    expect(personCard.exists()).toBe(true)

    // デフォルト人物データが渡されているか
    const props = personCard.props()
    expect(props.person).toBeDefined()
    expect(props.person.name).toBe('田中 太郎')
    expect(props.person.gender).toBe('male')
    expect(props.person.birthDate).toBe('1990-04-15')
    expect(props.person.birthPlace).toBe('東京都')
  })

  it('フローティングボタンが存在し、クリック時に適切に動作するか', async () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          PersonCard: true,
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
      '人物追加機能は今後実装予定です。\n現在は人物表示デザインの確認ができます。'
    )
  })

  it('defaultPersonの計算プロパティが正しく動作するか', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          PersonCard: true,
        },
      },
    })

    // defaultPersonが正しく設定されているか
    const vm = wrapper.vm as any
    expect(vm.defaultPerson).toBeDefined()
    expect(vm.defaultPerson.id).toBe('default-person-1')
    expect(vm.defaultPerson.name).toBe('田中 太郎')
    expect(vm.defaultPerson.gender).toBe('male')
    expect(vm.defaultPerson.birthDate).toBe('1990-04-15')
    expect(vm.defaultPerson.birthPlace).toBe('東京都')
  })

  it('レスポンシブ対応のCSS構造が適用されているか', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          PersonCard: true,
        },
      },
    })

    // 主要なレスポンシブ要素の存在確認
    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.find('.content-area').exists()).toBe(true)
    expect(wrapper.find('.family-tree-area').exists()).toBe(true)
    expect(wrapper.find('.floating-add-btn').exists()).toBe(true)
  })

  it('tree-containerが正しく構成されているか', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          PersonCard: true,
        },
      },
    })

    const treeContainer = wrapper.find('.tree-container')
    expect(treeContainer.exists()).toBe(true)

    // PersonCardが tree-container 内に配置されているか
    const personCardInContainer = treeContainer.findComponent(PersonCard)
    expect(personCardInContainer.exists()).toBe(true)
  })
})