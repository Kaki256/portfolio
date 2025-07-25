<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import type { Work } from '../../types/work'
import { works as initialWorks } from '../../data/works' // データをインポート

const works = ref<Work[]>(initialWorks)

// markdownパーサーを初期化
const md = new MarkdownIt({
  html: false, // HTMLタグを許可しない
  breaks: true, // 改行を<br>に変換
  linkify: true, // URLを自動的にリンクに変換
})

const activeFilter = ref<string>('all')

const filterWorks = () => {
  if (activeFilter.value === 'all') {
    return works.value
  }
  return works.value.filter((work) => work.type === activeFilter.value)
}

const expandedWork = ref<string | null>(null)

const toggleExpand = (id: string) => {
  if (expandedWork.value === id) {
    expandedWork.value = null
  } else {
    expandedWork.value = id
  }
}

const setFilter = (filter: string) => {
  activeFilter.value = filter
  expandedWork.value = null
}

const getRandomColorClass = (() => {
  const colors = ['primary', 'secondary', 'accent', 'custom1', 'custom2']
  const cache: { [key: string]: string } = {}

  return (tech: string) => {
    if (!cache[tech]) {
      const randomIndex = Math.floor(Math.random() * colors.length)
      cache[tech] = colors[randomIndex]
    }
    return cache[tech]
  }
})()

// 難易度表示用
const getDifficultyStars = (difficulty?: number) => {
  if (!difficulty) return ''
  return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty)
}

// 作品タイプのラベル
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'development':
      return '開発'
    case 'riddle_solving':
      return '謎解き'
    case 'game':
      return 'ゲーム'
    default:
      return 'その他'
  }
}

// 画像表示用の状態を追加
const fullscreenImage = ref<string | null>(null)
const showImageModal = ref(false)

// プレースホルダー画像かどうかを判定する関数を追加
const isPlaceholderImage = (url?: string): boolean => {
  if (!url) return true // URLがない場合もプレースホルダー扱い
  return url.includes('placehold.co') || url.includes('placeholder')
}

// 画像をモーダルで表示する関数（修正版）
const openFullscreenImage = (imageUrl: string, event: Event) => {
  // イベント伝播を停止
  event.stopPropagation()

  // 画像を表示（条件チェックを削除）
  fullscreenImage.value = imageUrl
  showImageModal.value = true

  // スクロールを無効化
  document.body.style.overflow = 'hidden'
}

// モーダルを閉じる関数
const closeImageModal = () => {
  showImageModal.value = false
  fullscreenImage.value = null

  // スクロールを再有効化
  document.body.style.overflow = ''
}

// Escキーでモーダルを閉じる
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showImageModal.value) {
    closeImageModal()
  }
}

// マークダウンをHTMLに変換する関数
const renderMarkdown = (text?: string) => {
  if (!text) return ''
  const rendered = md.render(text)
  return DOMPurify.sanitize(rendered)
}

// イベントリスナーの設定
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  // ページ離脱時にスクロールを確実に再有効化
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="works-container">
    <h2>Works</h2>

    <div class="works-intro">
      <p>
        私が制作した開発プロジェクトや謎解き作品の一部です。
        各作品をクリックすると、詳細情報が表示されます。
      </p>
    </div>

    <!-- フィルターボタン -->
    <div class="filter-buttons">
      <button
        :class="['filter-btn', { active: activeFilter === 'all' }]"
        @click="setFilter('all')"
      >
        すべて
      </button>
      <button
        :class="['filter-btn', { active: activeFilter === 'development' }]"
        @click="setFilter('development')"
      >
        開発プロジェクト
      </button>
      <button
        :class="['filter-btn', { active: activeFilter === 'riddle_solving' }]"
        @click="setFilter('riddle_solving')"
      >
        謎解き
      </button>
      <button
        :class="['filter-btn', { active: activeFilter === 'game' }]"
        @click="setFilter('game')"
      >
        ゲーム
      </button>
    </div>

    <div class="works-grid">
      <div
        v-for="work in filterWorks()"
        :key="work.id"
        class="work-card"
        :class="{ expanded: expandedWork === work.id }"
      >
        <div class="work-image">
          <img
            :src="work.imageUrl"
            :alt="work.title"
          >
          <div class="work-overlay">
            <button
              v-if="work.imageUrl && !isPlaceholderImage(work.imageUrl)"
              class="details-button"
              @click.stop="openFullscreenImage(work.imageUrl, $event)"
            >
              画像を見る
            </button>
          </div>

          <div
            class="work-type-badge"
            :class="work.type"
          >
            {{ getTypeLabel(work.type) }}
          </div>
        </div>

        <div class="work-content">
          <h3>{{ work.title }}</h3>

          <div
            v-if="work.type === 'riddle_solving' || work.type === 'game'"
            class="puzzle-meta"
          >
            <div
              v-if="work.difficulty"
              class="difficulty"
            >
              難易度:
              <span class="stars">{{
                getDifficultyStars(work.difficulty)
              }}</span>
            </div>
            <div
              v-if="work.eventDate"
              class="event-date"
            >
              {{ work.eventDate }}
            </div>
          </div>

          <div
            class="work-description"
            v-html="renderMarkdown(work.description)"
          />

          <!-- 謎解き公演の追加情報 -->
          <div
            v-if="work.type === 'game' && expandedWork === work.id"
            class="show-details"
          >
            <p v-if="work.location">
              <strong>会場:</strong> {{ work.location }}
            </p>
            <p v-if="work.eventFormat">
              <strong>形式:</strong> {{ work.eventFormat }}
            </p>
            <p v-if="work.duration">
              <strong>所要時間:</strong> {{ work.duration }}
            </p>
            <p v-if="work.participants">
              <strong>参加者:</strong>
              <span v-html="renderMarkdown(work.participants)" />
            </p>
            <p v-if="work.role">
              <strong>担当:</strong>
              <span v-html="renderMarkdown(work.role)" />
            </p>
            <p v-if="work.collaborators && work.collaborators.length">
              <strong>協力:</strong><span
                v-html="renderMarkdown(work.collaborators.join('、'))"
              />
            </p>
          </div>

          <!-- 謎解きゲームの追加情報 -->
          <div
            v-if="work.type === 'riddle_solving' && expandedWork === work.id"
            class="game-details"
          >
            <p
              v-if="work.eventFormat"
              class="puzzle-format"
            >
              <strong>形式:</strong> {{ work.eventFormat }}
            </p>
            <p
              v-if="work.duration"
              class="duration"
            >
              <strong>所要時間:</strong> {{ work.duration }}
            </p>
            <p v-if="work.participants">
              <strong>対象:</strong> {{ work.participants }}
            </p>
            <p v-if="work.role">
              <strong>担当:</strong> {{ work.role }}
            </p>
          </div>

          <div class="tech-tags">
            <span
              v-for="tech in work.technologies"
              :key="tech"
              :class="['tech-tag', getRandomColorClass(tech)]"
            >
              {{ tech }}
            </span>
          </div>

          <div class="work-footer">
            <div class="work-links">
              <a
                v-if="work.demoUrl"
                :href="work.demoUrl"
                class="work-link link"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
              >
                <span class="link-icon">🔗</span>
                {{ work.type === 'development' ? 'Demo' : 'Play' }}
              </a>
              <a
                v-if="work.repoUrl"
                :href="work.repoUrl"
                class="work-link repo"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
              >
                <span class="link-icon">📦</span>
                GitHub
              </a>
            </div>

            <button
              class="toggle-details-button"
              @click="toggleExpand(work.id)"
            >
              {{ expandedWork === work.id ? '閉じる' : '詳細を見る' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 画像モーダル -->
    <div
      v-if="showImageModal"
      class="image-modal"
      @click="closeImageModal"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <button
          class="close-modal"
          @click="closeImageModal"
        >
          ×
        </button>
        <img
          :src="fullscreenImage || ''"
          alt="拡大画像"
          class="modal-image"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.works-container {
  max-width: 1000px;
  margin: 0 auto;
}

.works-intro {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 2rem;
}

/* フィルターボタン */
.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.filter-btn {
  background-color: white;
  border: 2px solid var(--secondary-color);
  color: var(--secondary-color);
  padding: 0.5rem 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active,
.filter-btn:hover {
  background-color: var(--secondary-color);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 206, 201, 0.3);
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.work-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  height: 460px;
  position: relative;
}

.work-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.work-card.expanded {
  grid-column: span 2;
  height: auto;
}

.work-image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.work-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.work-card:hover .work-image img {
  transform: scale(1.05);
}

/* 展開時の画像がクリック可能なことを示すスタイル */
.work-image.clickable {
  cursor: zoom-in;
}

.work-image.clickable .work-overlay span {
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  padding: 0.5rem 1rem;
}

/* 作品タイプバッジ */
.work-type-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.work-type-badge.development {
  background-color: var(--primary-color);
}

.work-type-badge.riddle_solving {
  background-color: #e17055;
}

.work-type-badge.game {
  background-color: #6c5ce7;
}

.work-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 184, 148, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 5;
}

.work-overlay span {
  color: white;
  font-weight: 600;
  border: 2px solid white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

.work-card:hover .work-overlay {
  opacity: 1;
}

.work-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: calc(100% - 200px);
}

.work-card.expanded .work-content {
  height: auto;
}

.work-card h3 {
  margin: 0 0 0.75rem;
  color: var(--primary-color);
  font-size: 1.4rem;
}

/* 謎解き作品のメタ情報 */
.puzzle-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.difficulty {
  color: #e17055;
}

.stars {
  color: #fdcb6e;
  letter-spacing: -2px;
}

.event-date {
  color: #636e72;
}

.work-description {
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
  white-space: pre-line;
}

.work-card.expanded .work-description {
  white-space: pre-line;
}

/* 謎解き公演・ゲームの追加詳細 */
.show-details,
.game-details {
  background-color: rgba(0, 0, 0, 0.03);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.show-details p,
.game-details p {
  margin-bottom: 0.5rem;
}

.show-details p:last-child,
.game-details p:last-child {
  margin-bottom: 0;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tech-tag {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.tech-tag.primary {
  background-color: rgba(0, 184, 148, 0.15);
  color: var(--primary-color);
}

.tech-tag.secondary {
  background-color: rgba(0, 206, 201, 0.15);
  color: var(--secondary-color);
}

.tech-tag.accent {
  background-color: rgba(253, 203, 110, 0.15);
  color: #e67e22;
}

.tech-tag.custom1 {
  background-color: rgba(162, 155, 254, 0.15);
  color: #7367f0;
}

.tech-tag.custom2 {
  background-color: rgba(85, 239, 196, 0.15);
  color: #16a085;
}

.work-links {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.work-link {
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.work-link.link {
  background-color: var(--primary-color);
  color: white;
}

.work-link.repo {
  background-color: #2d3436;
  color: white;
}

.work-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2);
}

.link-icon {
  font-size: 1.1rem;
}

/* 拡大ボタンのスタイル */
.zoom-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  z-index: 10;
  opacity: 0;
  transform: scale(0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* カードホバー時にボタンを表示 */
.work-card:hover .zoom-button {
  opacity: 1;
  transform: scale(1);
}

.zoom-button:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 詳細表示ボタンのスタイル */
.details-button {
  background-color: white;
  color: var(--primary-color);
  border: 2px solid white;
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.details-button::before {
  content: '📷'; /* 画像アイコン */
  font-size: 1.2rem;
}

/* 画像がない場合のアイコン */
.work-image:not([src]) + .work-overlay .details-button::before {
  content: '📝'; /* 詳細アイコン */
}

/* カード下部の詳細表示ボタン */
.work-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.toggle-details-button {
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  background-color: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: auto;
}

.toggle-details-button:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 184, 148, 0.3);
}

/* 画像モーダルのスタイル */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  box-sizing: border-box;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  display: block;
  border-radius: 4px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.close-modal {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-modal:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* モバイル向け調整 */
@media (max-width: 768px) {
  .filter-buttons {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 1rem;
  }

  .filter-btn {
    flex: 0 0 auto;
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }

  .works-grid {
    grid-template-columns: 1fr;
  }

  .work-card.expanded {
    grid-column: span 1;
  }

  .work-card {
    height: auto;
  }

  .work-description {
    line-clamp: 1;
    -webkit-line-clamp: 1; /* モバイル表示でも1行に制限 */
  }

  .modal-content {
    width: 95vw;
  }

  .close-modal {
    top: -30px;
    right: 0;
  }
}
</style>
