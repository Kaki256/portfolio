export interface Problem {
  id: string
  title: string
  description: string
  type: 'riddle' | 'math' | 'logic' | 'other' // 問題タイプ
  imageUrl?: string
  difficulty: number // 1〜10
  hint?: string
  solution?: string
  category?: string // 例：「数列」「確率」「なぞなぞ」など
  tags?: string[] // 任意のタグ
}
