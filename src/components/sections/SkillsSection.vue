<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Skill } from '../../types/skill'
import { skills as initialSkills } from '../../data/skills'

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

onMounted(() => {
  // スキルバーのアニメーション
  setTimeout(() => {
    animated.value = Array(skills.value.length).fill(true)
  }, 500)
})

// 最終更新日
const lastUpdated = '2025年4月18日'
</script>

<template>
  <div class="skills-container">
    <h2>スキル</h2>

    <div class="skills-intro">
      <p>
        私が持っているスキルセットです。常に新しい技術を学び、スキルを向上させることを心がけています。
      </p>
      <p class="section-last-updated">
        最終更新: {{ lastUpdated }}
      </p>
    </div>

    <div class="filter-buttons">
      <button
        v-for="filter in filters"
        :key="filter.id"
        :class="['filter-button', { active: activeFilter === filter.id }]"
        @click="changeFilter(filter.id)"
      >
        {{ filter.label }}
      </button>
    </div>

    <div class="skills-grid">
      <div
        v-for="(skill, index) in filteredSkills()"
        :key="skill.id"
        class="skill-card"
      >
        <div class="skill-icon">
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-container {
  max-width: 1000px;
  margin: 0 auto;
}

.skills-intro {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 2rem;
}

.section-last-updated {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin-top: -1rem;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.filter-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.filter-button {
  background-color: white;
  border: 2px solid var(--secondary-color);
  color: var(--secondary-color);
  padding: 0.5rem 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button.active,
.filter-button:hover {
  background-color: var(--secondary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 206, 201, 0.3);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.skill-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
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
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
}

.skill-icon {
  font-size: 2rem;
  background-color: rgba(0, 206, 201, 0.1);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-weight: 600;
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
  border-radius: 5px;
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
