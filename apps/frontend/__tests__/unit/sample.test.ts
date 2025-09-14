import { describe, it, expect } from 'vitest'

describe('サンプルテスト', () => {
  it('基本的なテスト動作確認', () => {
    expect(1 + 1).toBe(2)
  })

  it('配列の操作テスト', () => {
    const arr = [1, 2, 3]
    expect(arr).toContain(2)
    expect(arr).toHaveLength(3)
  })
})
