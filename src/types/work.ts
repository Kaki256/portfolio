export interface Work {
  id: string
  title: string
  description: string
  imageUrl?: string
  technologies: string[]
  demoUrl?: string
  repoUrl?: string

  // 作品の種類を追加
  type: 'development' | 'riddle_solving' | 'game' | 'other'

  // 謎解き公演やゲーム用の追加フィールド
  eventDate?: string // イベント日
  location?: string // 開催場所/会場
  role?: string // 担当した役割（例：制作、出題、演出など）
  difficulty?: number // 難易度（1-5）
  participants?: string // 参加人数や対象者
  collaborators?: string[] // 共同制作者
  eventFormat?: string // ルーム型・ホール型・周遊型など
  duration?: string // 所要時間（例：「約60分」「40-50分」など）
}
