<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it' // マークダウンライブラリを追加
import DOMPurify from 'dompurify' // サニタイザーを追加
import type { RiddleShow } from '../../types/riddle'
import { riddlesShows as initialRiddles } from '../../data/riddles' // データをインポート

const riddlesShow = ref<RiddleShow[]>(initialRiddles)

// マークダウンパーサーの初期化
const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
})

// マークダウンをHTMLに変換する関数
const renderMarkdown = (text?: string) => {
  if (!text) return ''
  const rendered = md.render(text)
  return DOMPurify.sanitize(rendered)
}

const hoveredRiddle = ref<string | null>(null)

const setHovered = (id: string | null) => {
  hoveredRiddle.value = id
}

// リンククリック時にイベントバブリングを停止する関数を追加
const handleLinkClick = (event: Event) => {
  event.stopPropagation() // イベントの伝播を停止
}

// 最終更新日
const lastUpdated = '2025年4月18日'

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
</script>

<template>
  <div
    ref="target"
    class="riddle-shows-container"
    :class="{ 'is-visible': isVisible }"
  >
    <h2>Love Riddles</h2>

    <div class="riddle-show-intro">
      <p>
        謎解き公演は論理的思考とクリエイティブな発想を融合させる芸術です。
        以下は私が特に感銘を受けた謎解き公演の数々です。
      </p>
      <p class="section-last-updated">最終更新: {{ lastUpdated }}</p>
    </div>

    <div class="riddle-cards">
      <div
        v-for="show in riddlesShow"
        :key="show.id"
        class="riddle-card"
        :class="{ active: hoveredRiddle === show.id }"
        @mouseenter="setHovered(show.id)"
        @mouseleave="setHovered(null)"
      >
        <div class="riddle-image">
          <img :src="show.imageUrl" :alt="show.title" />
        </div>

        <div class="riddle-info">
          <h3>{{ show.title }}</h3>
          <p class="riddle-meta">
            <span class="creator">{{ show.creator }}</span>
            <span class="year">{{ show.year }}</span>
          </p>
        </div>

        <!-- スライドオーバーレイ -->
        <div class="riddle-overlay">
          <div class="overlay-content">
            <h3>{{ show.title }}</h3>
            <div
              class="description"
              v-html="renderMarkdown(show.description)"
            />

            <div v-if="show.link" class="link-container">
              <a
                :href="show.link"
                target="_blank"
                rel="noopener noreferrer"
                class="riddle-link"
                @click="handleLinkClick"
              >
                詳細を見る
                <span class="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.riddle-shows-container {
  max-width: 1000px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.5s ease-out,
    transform 0.5s ease-out;
}

.riddle-shows-container.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.riddle-show-intro {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
}

.riddle-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.5rem;
}

/* 新しいカードスタイル */
.riddle-card {
  position: relative;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 20px var(--card-shadow-color);
  transition: all 0.4s ease;
  background-color: var(--card-background-color);
  cursor: pointer;
}

.riddle-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--box-shadow-lg);
}

.riddle-image {
  height: 65%;
  overflow: hidden;
}

.riddle-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.riddle-card:hover .riddle-image img {
  transform: scale(1.05);
}

.riddle-info {
  padding: 1.25rem;
  height: 35%;
}

.riddle-meta {
  display: flex;
  justify-content: space-between;
  color: var(--text-color-light);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* スライドオーバーレイスタイル */
.riddle-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  overflow: hidden;
  transition: var(--transition-card-hover);
  border-radius: var(--border-radius-md);
  opacity: 0.98;
}

.riddle-card.active .riddle-overlay {
  height: 100%;
}

.overlay-content {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: opacity 0.3s ease;
  transition-delay: 0.1s;
}

.riddle-card.active .overlay-content {
  opacity: 1;
}

/* 新しく追加：オーバーレイのタイトルスタイル強化 */
.overlay-content h3 {
  font-size: 1.5rem;
  color: #ffffff;
  font-weight: var(--font-weight-bold);
  margin-bottom: 0.8rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  position: relative;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.5);
}

/* カードタイトルにホバーアニメーション追加 */
.riddle-card.active .overlay-content h3 {
  animation: titlePulse 1.5s infinite alternate ease-in-out;
}

@keyframes titlePulse {
  from {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }
  to {
    text-shadow: 0 2px 8px rgba(255, 255, 255, 0.5);
  }
}

/* マークダウンスタイル */
:deep(.description) {
  margin: 1rem 0;
  overflow-y: auto;
  max-height: 220px;
  padding-right: 10px;
  line-height: 1.6;
  flex-grow: 1;
}

/* 見出しのスタイル改善 */
:deep(.description h1) {
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: #ffffff; /* 純白に変更 */
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); /* シャドウ追加 */
  padding-bottom: 0.3rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.4); /* 下線追加 */
}

:deep(.description h2) {
  font-size: 1.2rem;
  margin-bottom: 0.7rem;
  color: #f5f5f5; /* 少し明るい白に変更 */
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25); /* シャドウ追加 */
  position: relative;
  padding-left: 1rem;
}

/* h2に装飾を追加 */
:deep(.description h2)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.2rem;
  bottom: 0.2rem;
  width: 4px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: var(--border-radius-sm);
}

:deep(.description p) {
  margin-bottom: 0.7rem;
  color: rgba(255, 255, 255, 0.9); /* 本文は若干透明度を持たせる */
}

/* マークダウンリンクのスタイルも追加 */
:deep(.description a) {
  color: #ffffff;
  text-decoration: underline;
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-ease-in-out);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

:deep(.description a:hover) {
  color: #e0f7fa; /* 薄い水色に変化 */
  text-decoration-thickness: 2px;
}

/* スクロールバーのスタイル */
:deep(.description::-webkit-scrollbar) {
  width: 6px;
}

:deep(.description::-webkit-scrollbar-track) {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

:deep(.description::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.3);
  border-radius: var(--border-radius-sm);
}

/* リンクスタイル */
.link-container {
  text-align: center;
  padding-top: 0.5rem;
}

.riddle-link {
  display: inline-block;
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.riddle-link:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.riddle-link .arrow {
  transition: transform 0.3s ease;
  display: inline-block;
  margin-left: 4px;
}

.riddle-link:hover .arrow {
  transform: translateX(5px);
}

/* モバイルレスポンシブ対応 */
@media (max-width: 768px) {
  .riddle-cards {
    grid-template-columns: 1fr;
  }

  .riddle-card {
    height: 350px;
  }

  :deep(.description) {
    max-height: 180px;
  }
}

.section-last-updated {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin-top: -1rem;
  margin-bottom: 1.5rem;
  font-style: italic;
}
</style>
