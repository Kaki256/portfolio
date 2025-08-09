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

// 展開はモーダル化するため、expandedWorkは使用しないが互換のため残す
const expandedWork = ref<string | null>(null)

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

// 詳細モーダル
const showWorkModal = ref(false)
const selectedWork = ref<Work | null>(null)

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

  // 他のモーダルが開いていない場合のみスクロールを再有効化
  if (!showWorkModal.value) {
    document.body.style.overflow = ''
  }
}

// 作品詳細モーダルの開閉
const openWorkModal = (work: Work) => {
  selectedWork.value = work
  showWorkModal.value = true
  document.body.style.overflow = 'hidden'
}
const closeWorkModal = () => {
  showWorkModal.value = false
  selectedWork.value = null
  // 次フレームで確実に解除（競合回避）。他モーダルが無いときのみ解除
  requestAnimationFrame(() => {
    if (!showImageModal.value) {
      document.body.style.overflow = ''
    }
  })
}

// Escキーでモーダルを閉じる
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (showImageModal.value) closeImageModal()
    if (showWorkModal.value) closeWorkModal()
  }
}

// マークダウンをHTMLに変換する関数
const renderMarkdown = (text?: string) => {
  if (!text) return ''
  const rendered = md.render(text)
  return DOMPurify.sanitize(rendered)
}

const target = ref<HTMLElement | null>(null)
const isVisible = ref(false)

let observer: IntersectionObserver

// イベントリスナーの設定
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)

  if (!target.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
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
  window.removeEventListener('keydown', handleKeyDown)
  // ページ離脱時にスクロールを確実に再有効化
  document.body.style.overflow = ''

  if (observer && target.value) {
    observer.unobserve(target.value)
  }
})
</script>

<template>
  <div
    ref="target"
    class="works-container"
    :class="{ 'is-visible': isVisible }"
  >
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
        :class="['filter-button', { active: activeFilter === 'all' }]"
        @click="setFilter('all')"
      >
        すべて
      </button>
      <button
        :class="['filter-button', { active: activeFilter === 'development' }]"
        @click="setFilter('development')"
      >
        開発プロジェクト
      </button>
      <button
        :class="[
          'filter-button',
          { active: activeFilter === 'riddle_solving' },
        ]"
        @click="setFilter('riddle_solving')"
      >
        謎解き
      </button>
      <button
        :class="['filter-button', { active: activeFilter === 'game' }]"
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
          <h3>
            {{ work.title }}
            <span
              v-if="work.isInternal"
              class="internal-badge"
            >
              (traP内限定)
            </span>
          </h3>

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
              @click="openWorkModal(work)"
            >
              詳細を見る
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 画像モーダル（body 直下へテレポート） -->
    <teleport to="body">
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
    </teleport>

    <!-- 作品詳細モーダル（body 直下へテレポート） -->
    <teleport to="body">
      <div
        v-if="showWorkModal && selectedWork"
        class="work-modal"
        @click="closeWorkModal"
      >
        <div
          class="work-modal-content"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <button
            class="close-modal"
            type="button"
            aria-label="閉じる"
            @click="closeWorkModal"
          >
            ×
          </button>
          <div class="work-modal-header">
            <div
              class="work-type-badge"
              :class="selectedWork.type"
            >
              {{ getTypeLabel(selectedWork.title) }}
            </div>
            <h3 class="work-modal-title">
              {{ selectedWork.title }}
              <span
                v-if="selectedWork.isInternal"
                class="internal-badge"
              >
                (traP内限定)
              </span>
            </h3>
          </div>
          <div class="work-modal-body">
            <div
              v-if="selectedWork.imageUrl && !isPlaceholderImage(selectedWork.imageUrl)"
              class="work-modal-image"
              role="button"
              tabindex="0"
              aria-label="画像を拡大表示"
              @click="openFullscreenImage(selectedWork.imageUrl, $event)"
            >
              <img
                :src="selectedWork.imageUrl"
                :alt="selectedWork.title"
              >
            </div>
            <div
              class="work-modal-description"
              v-html="renderMarkdown(selectedWork.description)"
            />

            <!-- タイプ別メタ情報 -->
            <div
              v-if="selectedWork.type === 'game'"
              class="work-modal-extra"
            >
              <p v-if="selectedWork.location">
                <strong>会場:</strong>
                {{ selectedWork.location }}
              </p>
              <p v-if="selectedWork.eventFormat">
                <strong>形式:</strong>
                {{ selectedWork.eventFormat }}
              </p>
              <p v-if="selectedWork.duration">
                <strong>所要時間:</strong>
                {{ selectedWork.duration }}
              </p>
              <p v-if="selectedWork.participants">
                <strong>参加者:</strong>
                <span v-html="renderMarkdown(selectedWork.participants)" />
              </p>
              <p v-if="selectedWork.role">
                <strong>担当:</strong>
                <span v-html="renderMarkdown(selectedWork.role)" />
              </p>
              <p v-if="selectedWork.collaborators && selectedWork.collaborators.length">
                <strong>協力:</strong>
                <span v-html="renderMarkdown(selectedWork.collaborators.join('、'))" />
              </p>
            </div>
            <div
              v-else-if="selectedWork.type === 'riddle_solving'"
              class="work-modal-extra"
            >
              <p v-if="selectedWork.eventFormat">
                <strong>形式:</strong>
                {{ selectedWork.eventFormat }}
              </p>
              <p v-if="selectedWork.duration">
                <strong>所要時間:</strong>
                {{ selectedWork.duration }}
              </p>
              <p v-if="selectedWork.participants">
                <strong>対象:</strong>
                {{ selectedWork.participants }}
              </p>
              <p v-if="selectedWork.role">
                <strong>担当:</strong>
                {{ selectedWork.role }}
              </p>
            </div>

            <!-- 技術タグ -->
            <div class="tech-tags">
              <span
                v-for="tech in selectedWork.technologies"
                :key="tech"
                :class="['tech-tag', getRandomColorClass(tech)]"
              >
                {{ tech }}
              </span>
            </div>

            <!-- リンク -->
            <div class="work-modal-links">
              <a
                v-if="selectedWork.demoUrl"
                :href="selectedWork.demoUrl"
                class="work-link link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="link-icon">🔗</span>
                {{ selectedWork.type === 'development' ? 'Demo' : 'Play' }}
              </a>
              <a
                v-if="selectedWork.repoUrl"
                :href="selectedWork.repoUrl"
                class="work-link repo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="link-icon">📦</span>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.works-container {
  max-width: 1000px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.5s ease-out,
    transform 0.5s ease-out;
}

.works-container.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.works-intro {
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

.filter-button {
  background-color: var(--button-background-color);
  border: 2px solid var(--secondary-color);
  color: var(--button-text-color);
  padding: 0.5rem 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button.active,
.filter-button:hover {
  background-color: var(--button-hover-background-color);
  color: var(--button-hover-text-color);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.work-card {
  background-color: var(--card-background-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 20px var(--card-shadow-color);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  height: 460px;
  position: relative;
}

.work-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--box-shadow-lg);
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

/* 作品タイプバッジ */
.work-type-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: var(--border-radius-lg);
  font-size: 0.75rem;
  font-weight: var(--font-weight-semibold);
  color: white;
  box-shadow: var(--box-shadow-sm);
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

.work-card:hover .work-overlay {
  opacity: 1;
}

.work-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: calc(100% - 200px);
}

.work-card h3 {
  margin: 0 0 0.75rem;
  color: var(--primary-color);
  font-size: 1.4rem;
}

.internal-badge {
  font-size: 0.9rem;
  color: #e17055;
  font-weight: var(--font-weight-normal);
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

/* 技術タグ */
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tech-tag {
  padding: 0.3rem 0.8rem;
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
  font-weight: var(--font-weight-semibold);
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
  box-shadow: var(--box-shadow-md);
}

.link-icon {
  font-size: 1.1rem;
}

/* 詳細表示ボタンのスタイル */
.details-button {
  background-color: white;
  color: var(--primary-color);
  border: 2px solid white;
  border-radius: var(--border-radius-lg);
  padding: 0.5rem 1.2rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-ease-in-out);
  box-shadow: var(--box-shadow-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.details-button::before {
  content: '📷'; /* 画像アイコン */
  font-size: 1.2rem;
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
  box-shadow: var(--box-shadow-md);
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
  z-index: 10000; /* 他の装飾より常に上 */
  padding: max(1.5rem, env(safe-area-inset-top)) max(1.5rem, env(safe-area-inset-right)) max(1.5rem, env(safe-area-inset-bottom)) max(1.5rem, env(safe-area-inset-left));
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: fadeIn 0.3s ease-out;
}

/* 画像モーダル/作品モーダルの内側はパディング込みで幅・高さを計算 */
.modal-content,
.work-modal-content {
  box-sizing: border-box;
}

/* 作品詳細モーダルの横スクロール抑制と余白の最適化 */
.work-modal-content {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 90vh; /* スクロール前提の上限 */
  -webkit-overflow-scrolling: touch;
}

/* 本文・追加情報・タグの省略/高さ制限を解除（後勝ちで上書き） */
.work-modal-description {
  display: block;
  overflow: visible;
  -webkit-line-clamp: initial;
  line-clamp: initial;
}
.work-modal-extra {
  max-height: none;
  overflow: visible;
}
.work-modal-body .tech-tags {
  max-height: none;
  overflow: visible;
}

@media (max-width: 768px) {
  .work-modal-content {
    width: clamp(320px, 94vw, 900px);
    max-height: 88vh; /* モバイルは少し余裕 */
  }
  .work-modal-image, .work-modal-image img {
    max-height: 40vh;
  }
  .work-modal-description {
    line-clamp: 7; /* 標準プロパティ */
    -webkit-line-clamp: 7;
  }
  .work-modal-extra {
    max-height: 24vh;
  }
}

/* 画像クリックで拡大を示す */
.work-modal-image { cursor: zoom-in; }

/* モーダル内画像は小さめ（相対値） */
.work-modal-image { max-height: 35vh; }
.work-modal-image img { max-height: 35vh; }
@media (max-width: 768px) {
  .work-modal-image { max-height: 40vh; }
  .work-modal-image img { max-height: 40vh; }
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
  border-radius: var(--border-radius-circle);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-ease-in-out);
}

.close-modal:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 作品詳細モーダル */
.work-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: max(1.5rem, env(safe-area-inset-top)) max(1.5rem, env(safe-area-inset-right)) max(1.5rem, env(safe-area-inset-bottom)) max(1.5rem, env(safe-area-inset-left));
}

.work-modal-content {
  position: relative;
  width: min(900px, 95vw);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--card-background-color);
  border-radius: 12px;
  box-shadow: var(--box-shadow-lg);
  padding: 1.5rem;
  animation: fadeIn 0.2s ease-out;

  /* 作品詳細モーダル内の余白を調整して、右上の閉じるボタンと重ならないようにする */
  padding-right: 3rem; /* スクロールバーや要素が被らない余白 */
  padding-top: 2.75rem; /* ヘッダがボタン下に潜り込まないように */
}

/* 作品詳細モーダルのメイン画像（相対値のみで制御） */
.work-modal-image {
  width: 100%;
  max-height: 60vh; /* ビューポートに対する相対上限 */
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 以前の固定値 height 指定をコメントアウト（残骸除去） */
/* .work-modal-image { height: min(360px, 40vh); } */
/* @media (max-width: 768px) { .work-modal-image { height: min(320px, 40vh); } } */

.work-modal-image img {
  max-width: 100%;
  max-height: 60vh; /* 高さのみ相対で固定 */
  width: auto;
  height: auto; /* アスペクト比維持 */
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .work-modal-image {
    max-height: 55vh;
  }
  .work-modal-image img {
    max-height: 55vh;
  }
}

/* モーダル内のタイプバッジは通常フローで表示（カード用の absolute を無効化） */
.work-modal-content .work-type-badge {
  position: static;
  top: auto;
  right: auto;
  box-shadow: none;
}

/* 閉じるボタンを前面に */
.work-modal .close-modal {
  z-index: 10;
}

/* 画像モーダルは常に最前面に */
.image-modal {
  z-index: 20000;
}

/* 作品詳細モーダル（後勝ちの定義を正して非スクロール＆相対サイズを維持） */
.work-modal-content {
  width: clamp(320px, 92vw, 900px);
  max-height: 85vh;
  overflow: hidden; /* 内部スクロール禁止 */
}
</style>
