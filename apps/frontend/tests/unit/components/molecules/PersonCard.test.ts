import PersonCard from '@/components/molecules/PersonCard.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { Person } from '~/../../shared/types/person'

const mockPerson: Person = {
  id: 'test-person-1',
  name: '田中 太郎',
  gender: 'male',
  birthDate: '1990-04-15',
  birthPlace: '東京都',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('PersonCard.vue', () => {
  it('正常にマウントできるか', () => {
    const wrapper = mount(PersonCard, {
      props: {
        person: mockPerson,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('人物の基本情報が表示されるか', () => {
    const wrapper = mount(PersonCard, {
      props: {
        person: mockPerson,
      },
    })

    // 名前の表示確認
    const name = wrapper.find('.person-name')
    expect(name.exists()).toBe(true)
    expect(name.text()).toBe('田中 太郎')

    // 生年月日の表示確認
    const birthDate = wrapper.find('.person-birth')
    expect(birthDate.exists()).toBe(true)
    expect(birthDate.text()).toContain('1990')

    // 出生地の表示確認
    const birthPlace = wrapper.find('.person-place')
    expect(birthPlace.exists()).toBe(true)
    expect(birthPlace.text()).toContain('東京都')
  })

  it('性別に応じたアバタークラスが適用されるか', () => {
    // 男性の場合
    const maleWrapper = mount(PersonCard, {
      props: {
        person: { ...mockPerson, gender: 'male' },
      },
    })
    expect(maleWrapper.find('.person-avatar--male').exists()).toBe(true)

    // 女性の場合
    const femaleWrapper = mount(PersonCard, {
      props: {
        person: { ...mockPerson, gender: 'female' },
      },
    })
    expect(femaleWrapper.find('.person-avatar--female').exists()).toBe(true)

    // 不明の場合
    const unknownWrapper = mount(PersonCard, {
      props: {
        person: { ...mockPerson, gender: 'unknown' },
      },
    })
    expect(unknownWrapper.find('.person-avatar--unknown').exists()).toBe(true)
  })

  it('名前が未設定の場合にデフォルトテキストが表示されるか', () => {
    const wrapper = mount(PersonCard, {
      props: {
        person: { ...mockPerson, name: undefined },
      },
    })

    const name = wrapper.find('.person-name')
    expect(name.text()).toBe('名前未設定')
  })

  it('オプション情報が存在しない場合は表示されないか', () => {
    const minimalPerson: Person = {
      id: 'minimal-person',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const wrapper = mount(PersonCard, {
      props: {
        person: minimalPerson,
      },
    })

    // 生年月日が未設定の場合は表示されない
    expect(wrapper.find('.person-birth').exists()).toBe(false)
    // 出生地が未設定の場合は表示されない
    expect(wrapper.find('.person-place').exists()).toBe(false)
    // メモが未設定の場合は表示されない
    expect(wrapper.find('.person-memo').exists()).toBe(false)
  })

  it('適切なCSSクラスが適用されているか', () => {
    const wrapper = mount(PersonCard, {
      props: {
        person: mockPerson,
      },
    })

    expect(wrapper.find('.person-card').exists()).toBe(true)
    expect(wrapper.find('.person-avatar').exists()).toBe(true)
    expect(wrapper.find('.person-icon').exists()).toBe(true)
    expect(wrapper.find('.person-name').exists()).toBe(true)
    expect(wrapper.find('.person-details').exists()).toBe(true)
  })

  it('メモが設定されている場合に表示されるか', () => {
    const personWithMemo: Person = {
      ...mockPerson,
      memo: 'エンジニアとして働いています',
    }

    const wrapper = mount(PersonCard, {
      props: {
        person: personWithMemo,
      },
    })

    const memo = wrapper.find('.person-memo')
    expect(memo.exists()).toBe(true)
    expect(memo.text()).toBe('エンジニアとして働いています')
  })
})