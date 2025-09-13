// import type { Person, Relationship } from '@/types/components'

// /**
//  * Phase 1-Aテスト用サンプルデータ
//  * 3世代の家系図データを提供
//  */
// export function useSampleData() {
//   // サンプル人物データ（3世代）
//   const samplePeople: Person[] = [
//     // 第0世代（祖父母）
//     {
//       id: 'grandfather-1',
//       name: '田中 太郎',
//       gender: 'male',
//       birthDate: '1930-01-15',
//       deathDate: '2010-03-20',
//       birthPlace: '東京都',
//       memo: '会社員として働いていた',
//     },
//     {
//       id: 'grandmother-1',
//       name: '田中 花子',
//       gender: 'female',
//       birthDate: '1935-05-10',
//       deathDate: '2015-08-12',
//       birthPlace: '神奈川県',
//       memo: '専業主婦',
//     },

//     // 第1世代（父母）
//     {
//       id: 'father-1',
//       name: '田中 一郎',
//       gender: 'male',
//       birthDate: '1960-03-25',
//       birthPlace: '東京都',
//       memo: 'IT企業勤務',
//     },
//     {
//       id: 'mother-1',
//       name: '田中 美代子',
//       gender: 'female',
//       birthDate: '1965-07-08',
//       birthPlace: '埼玉県',
//       memo: '看護師',
//     },

//     // 第2世代（子供たち）
//     {
//       id: 'child-1',
//       name: '田中 健太',
//       gender: 'male',
//       birthDate: '1990-09-15',
//       birthPlace: '東京都',
//       memo: 'エンジニア',
//     },
//     {
//       id: 'child-2',
//       name: '田中 恵美',
//       gender: 'female',
//       birthDate: '1993-12-03',
//       birthPlace: '東京都',
//       memo: 'デザイナー',
//     },
//     {
//       id: 'child-3',
//       name: '田中 養子',
//       gender: 'male',
//       birthDate: '1995-06-20',
//       birthPlace: '千葉県',
//       memo: '養子として迎えられた',
//     },
//   ]

//   // サンプル関係データ
//   const sampleRelationships: Relationship[] = [
//     // 祖父母 → 父母
//     {
//       id: 'rel-1',
//       parentId: 'grandfather-1',
//       childId: 'father-1',
//       type: 'biological',
//     },
//     {
//       id: 'rel-2',
//       parentId: 'grandmother-1',
//       childId: 'father-1',
//       type: 'biological',
//     },

//     // 父母 → 子供たち
//     {
//       id: 'rel-3',
//       parentId: 'father-1',
//       childId: 'child-1',
//       type: 'biological',
//     },
//     {
//       id: 'rel-4',
//       parentId: 'mother-1',
//       childId: 'child-1',
//       type: 'biological',
//     },
//     {
//       id: 'rel-5',
//       parentId: 'father-1',
//       childId: 'child-2',
//       type: 'biological',
//     },
//     {
//       id: 'rel-6',
//       parentId: 'mother-1',
//       childId: 'child-2',
//       type: 'biological',
//     },

//     // 養子関係
//     {
//       id: 'rel-7',
//       parentId: 'father-1',
//       childId: 'child-3',
//       type: 'adopted',
//     },
//     {
//       id: 'rel-8',
//       parentId: 'mother-1',
//       childId: 'child-3',
//       type: 'adopted',
//     },
//   ]

//   // 最小限のサンプルデータ（テスト用）
//   const minimalSamplePeople: Person[] = [
//     {
//       id: 'person-1',
//       name: '父',
//       gender: 'male',
//       birthDate: '1960-01-01',
//     },
//     {
//       id: 'person-2',
//       name: '母',
//       gender: 'female',
//       birthDate: '1965-01-01',
//     },
//     {
//       id: 'person-3',
//       name: '子',
//       gender: 'male',
//       birthDate: '1990-01-01',
//     },
//   ]

//   const minimalSampleRelationships: Relationship[] = [
//     {
//       id: 'rel-min-1',
//       parentId: 'person-1',
//       childId: 'person-3',
//       type: 'biological',
//     },
//     {
//       id: 'rel-min-2',
//       parentId: 'person-2',
//       childId: 'person-3',
//       type: 'biological',
//     },
//   ]

//   // 空のデータセット
//   const emptyData = {
//     people: [] as Person[],
//     relationships: [] as Relationship[],
//   }

//   return {
//     // フルサンプルデータ（3世代）
//     fullSample: {
//       people: samplePeople,
//       relationships: sampleRelationships,
//     },

//     // 最小限サンプルデータ（2世代・3人）
//     minimalSample: {
//       people: minimalSamplePeople,
//       relationships: minimalSampleRelationships,
//     },

//     // 空データ
//     emptyData,

//     // 個別アクセス用
//     samplePeople,
//     sampleRelationships,
//     minimalSamplePeople,
//     minimalSampleRelationships,
//   }
// }
