import type {
  CreatePersonData,
  Gender,
  Person,
  UpdatePersonData,
} from '../../../apps/shared/types/person'

describe('Person型定義のテスト', () => {
  describe('Gender型', () => {
    test('有効な値が受け入れられること', () => {
      const male: Gender = 'male'
      const female: Gender = 'female'

      expect(male).toBe('male')
      expect(female).toBe('female')
    })

    test('Union Typesが正しく動作すること', () => {
      const genders: Gender[] = ['male', 'female']

      expect(genders).toHaveLength(2)
      expect(genders).toContain('male')
      expect(genders).toContain('female')
    })
  })

  describe('Person型', () => {
    test('完全なPerson型オブジェクトが作成できること', () => {
      const mockDate = new Date('2023-01-01')

      const person: Person = {
        id: '12345',
        name: '田中太郎',
        gender: 'male',
        birthDate: '1990-01-01',
        deathDate: '2023-12-31',
        birthPlace: '東京都',
        createdAt: mockDate,
        updatedAt: mockDate,
      }

      expect(person.id).toBe('12345')
      expect(person.name).toBe('田中太郎')
      expect(person.gender).toBe('male')
      expect(person.birthDate).toBe('1990-01-01')
      expect(person.deathDate).toBe('2023-12-31')
      expect(person.birthPlace).toBe('東京都')
      expect(person.createdAt).toEqual(mockDate)
      expect(person.updatedAt).toEqual(mockDate)
    })

    test('オプション項目なしでもPerson型が作成できること', () => {
      const mockDate = new Date('2023-01-01')

      const person: Person = {
        id: '12345',
        createdAt: mockDate,
        updatedAt: mockDate,
      }

      expect(person.id).toBe('12345')
      expect(person.name).toBeUndefined()
      expect(person.gender).toBeUndefined()
      expect(person.birthDate).toBeUndefined()
      expect(person.deathDate).toBeUndefined()
      expect(person.birthPlace).toBeUndefined()
    })

    test('readonly項目が読み取り専用であること', () => {
      const mockDate = new Date('2023-01-01')

      const person: Person = {
        id: '12345',
        name: '田中太郎',
        createdAt: mockDate,
        updatedAt: mockDate,
      }

      expect(() => {
        // @ts-expect-error readonly項目への代入はコンパイルエラーになるべき
        person.id = 'new-id'
      }).toThrow()

      expect(() => {
        // @ts-expect-error readonly項目への代入はコンパイルエラーになるべき
        person.createdAt = new Date()
      }).toThrow()

      expect(() => {
        // @ts-expect-error readonly項目への代入はコンパイルエラーになるべき
        person.updatedAt = new Date()
      }).toThrow()
    })
  })

  describe('CreatePersonData型', () => {
    test('id, createdAt, updatedAtが除外されていること', () => {
      const createData: CreatePersonData = {
        name: '新規太郎',
        gender: 'male',
        birthDate: '1990-01-01',
        birthPlace: '大阪府',
      }

      expect(createData.name).toBe('新規太郎')
      expect(createData.gender).toBe('male')
      expect(createData.birthDate).toBe('1990-01-01')
      expect(createData.birthPlace).toBe('大阪府')

      // @ts-expect-error id項目は存在しないはず
      expect(createData.id).toBeUndefined()
      // @ts-expect-error createdAt項目は存在しないはず
      expect(createData.createdAt).toBeUndefined()
      // @ts-expect-error updatedAt項目は存在しないはず
      expect(createData.updatedAt).toBeUndefined()
    })

    test('最小限の必須項目だけでも作成できること', () => {
      const createData: CreatePersonData = {}

      expect(Object.keys(createData)).toHaveLength(0)
    })
  })

  describe('UpdatePersonData型', () => {
    test('すべて項目がオプションであること', () => {
      const updateData: UpdatePersonData = {}

      expect(Object.keys(updateData)).toHaveLength(0)
    })

    test('一部の項目だけ更新できること', () => {
      const updateData: UpdatePersonData = {
        name: '更新太郎',
        gender: 'female',
      }

      expect(updateData.name).toBe('更新太郎')
      expect(updateData.gender).toBe('female')
      expect(updateData.birthDate).toBeUndefined()
      expect(updateData.deathDate).toBeUndefined()
      expect(updateData.birthPlace).toBeUndefined()
    })
  })
})