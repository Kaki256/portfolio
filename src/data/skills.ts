import type { Skill } from '../types/skill'
export const skills: Skill[] = [
  // フロントエンド
  { id: 'html', name: 'HTML', level: 3, category: 'frontend', icon: '🌐' },
  { id: 'css', name: 'CSS', level: 3, category: 'frontend', icon: '🎨' },
  {
    id: 'javascript',
    name: 'JavaScript',
    level: 4,
    category: 'frontend',
    icon: '📜',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    level: 4,
    category: 'frontend',
    icon: '📘',
  },
  { id: 'vue', name: 'Vue.js', level: 4, category: 'frontend', icon: '💚' },

  // バックエンド
  { id: 'sql', name: 'SQL', level: 2, category: 'backend', icon: '🗄️' },

  // デザイン
  { id: 'figma', name: 'Figma', level: 3, category: 'design', icon: '🖌️' },

  // その他
  { id: 'git', name: 'Git', level: 3, category: 'other', icon: '📦' },
  {
    id: 'puzzle-design',
    name: 'パズル制作',
    level: 4,
    category: 'other',
    icon: '🧩',
  },
  {
    id: 'riddle-design',
    name: '謎解き制作',
    level: 5,
    category: 'other',
    icon: '🧩',
  },
]
