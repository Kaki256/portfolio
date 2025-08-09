<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'
import type { Skill } from '../../types/skill'
import { skills as initialSkills } from '../../data/skills'
import { works } from '../../data/works'
import BaseButton from '../common/BaseButton.vue'

// 背景アニメーション機能を親コンポーネントから取得
const backgroundAnimation = inject('backgroundAnimation', {
  showOnlyBackgroundView: () => {},
  launchRocket: () => {},
  applyWind: () => {},
  applyLightning: () => {},
  getCurrentTheme: () => 'light' as 'light' | 'dark',
  handleIconClick: (actionId: string) => {
    console.log(actionId)
  },
})

// アイコンクリック時の処理
const handleIconClick = (iconAction?: string) => {
  if (iconAction) {
    backgroundAnimation.handleIconClick(iconAction)
  }
}

const skills = ref<Skill[]>(initialSkills)

// アクティブなフィルター
const activeFilter = ref<string>('all')
const filters = [
  { id: 'all', label: 'すべて' },
  { id: 'frontend', label: 'フロントエンド' },
  { id: 'backend', label: 'バックエンド' },
  { id: 'design', label: 'デザイン' },
  { id: 'other', label: 'その他' },
]

// フィルター適用関数
const filteredSkills = () => {
  if (activeFilter.value === 'all') {
    return skills.value
  }
  return skills.value.filter((skill) => skill.category === activeFilter.value)
}

// フィルター変更関数
const changeFilter = (filter: string) => {
  activeFilter.value = filter
}

// アニメーション用
const animated = ref<boolean[]>(Array(skills.value.length).fill(false))

const getProjectName = (projectId: string) => {
  const work = works.find((w) => w.id === projectId)
  return work ? work.title : ''
}

const target = ref<HTMLElement | null>(null)
const isVisible = ref(false)

let observer: IntersectionObserver

onMounted(() => {
  if (!target.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          // スキルバーのアニメーション
          setTimeout(() => {
            animated.value = Array(skills.value.length).fill(true)
          }, 500)
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.1,
    },
  )

  observer.observe(target.value)
})

onUnmounted(() => {
  if (observer && target.value) {
    observer.unobserve(target.value)
  }
})

// スキルカードクリック時のイベントハンドラ
const handleSkillClick = (skill: Skill) => {
  // iconAction が設定されている場合はアクションを実行
  if (skill.iconAction) {
    backgroundAnimation.handleIconClick(skill.iconAction)
  }
}

// 最終更新日
const lastUpdated = '2025年4月18日'
</script>

<template>
  <div
    ref="target"
    class="skills-container"
    :class="{ 'is-visible': isVisible }"
  >
    <h2>Skills</h2>

    <div class="skills-intro">
      <p>
        私が持っているスキルセットです。常に新しい技術を学び、スキルを向上させることを心がけています。
      </p>
      <p class="section-last-updated">最終更新: {{ lastUpdated }}</p>
    </div>

    <div class="filter-buttons">
      <BaseButton
        v-for="filter in filters"
        :key="filter.id"
        :active="activeFilter === filter.id"
        @click="changeFilter(filter.id)"
      >
        {{ filter.label }}
      </BaseButton>
    </div>

    <div class="skills-grid">
      <div
        v-for="(skill, index) in filteredSkills()"
        :key="skill.id"
        class="skill-card"
        :class="{ interactive: !!skill.iconAction }"
        @click="handleSkillClick(skill)"
      >
        <div
          class="skill-icon"
          :class="{ clickable: !!skill.iconAction }"
          @click.stop="handleIconClick(skill.iconAction)"
        >
          {{ skill.icon }}
        </div>
        <div class="skill-info">
          <div class="skill-name">
            {{ skill.name }}
          </div>
          <div class="skill-level-bar">
            <div
              class="skill-level-fill"
              :class="{ animated: animated[index] }"
              :style="{ width: `${animated[index] ? skill.level * 20 : 0}%` }"
            />
          </div>
          <div class="skill-level-stars">
            <span
              v-for="star in 5"
              :key="star"
              :class="['star', { filled: star <= skill.level }]"
            >
              ★
            </span>
          </div>
          <div
            v-if="skill.relatedProjectIds && skill.relatedProjectIds.length"
            class="related-projects"
          >
            <div class="project-label">関連プロジェクト:</div>
            <ul class="project-links-list">
              <li v-for="projectId in skill.relatedProjectIds" :key="projectId">
                <a :href="`#works`" class="project-link">
                  {{ getProjectName(projectId) }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-container {
  max-width: 1000px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.5s ease-out,
    transform 0.5s ease-out;
}

.skills-container.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.skills-intro {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
}

.section-last-updated {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-color-light);
  margin-top: -1rem;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.filter-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 3rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.skill-card {
  background-color: var(--card-background-color);
  border-radius: 10px;
  box-shadow: 0 8px 15px var(--card-shadow-color);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.skill-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-lg);
}

.skill-icon {
  font-size: 2rem;
  background-color: rgba(0, 206, 201, 0.1);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-weight: var(--font-weight-semibold);
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-size: 1.1rem;
}

.skill-level-bar {
  height: 10px;
  background-color: #f1f2f6;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.skill-level-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--secondary-color)
  );
  border-radius: var(--border-radius-sm);
  width: 0;
  transition: width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.skill-level-stars {
  display: flex;
  gap: 0.2rem;
}

.star {
  color: #dfe4ea;
  transition:
    color 0.5s ease,
    transform 0.3s ease;
}

.star.filled {
  color: var(--accent-color);
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.skill-card:hover .star.filled {
  animation: pop 0.4s ease forwards;
}

.related-projects {
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

.project-label {
  font-weight: var(--font-weight-semibold);
  color: var(--text-color-light);
  margin-bottom: 0.25rem;
  display: block;
}

.project-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.project-links-list li {
  margin-bottom: 0.25rem;
}

.project-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: var(--transition-ease-in-out);
}

.project-link:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

/* インタラクティブなスキルカード */
.skill-card.interactive {
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.skill-card.interactive::after {
  content: '🖱️ クリックしてみよう';
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 0.8rem;
  color: var(--accent-color);
  opacity: 0;
  transition: opacity 0.3s;
}

.skill-card.interactive:hover::after {
  opacity: 1;
}

.skill-icon.clickable {
  cursor: pointer;
  transition: transform 0.3s ease;
  position: relative;
}

.skill-icon.clickable:after {
  content: '';
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background-color: var(--accent-color);
  border-radius: 50%;
  opacity: 0.8;
  animation: pulse 1.5s infinite;
}

.skill-icon.clickable:hover {
  transform: scale(1.2);
  animation: wiggle 0.5s ease infinite;
}

@keyframes wiggle {
  0% {
    transform: rotate(0deg) scale(1.2);
  }
  25% {
    transform: rotate(-5deg) scale(1.2);
  }
  50% {
    transform: rotate(0deg) scale(1.2);
  }
  75% {
    transform: rotate(5deg) scale(1.2);
  }
  100% {
    transform: rotate(0deg) scale(1.2);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }

  .filter-buttons {
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .filter-button {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
