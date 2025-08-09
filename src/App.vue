<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import TheHeader from './components/layout/TheHeader.vue'
import AboutSection from './components/sections/AboutSection.vue'
import WorksSection from './components/sections/WorksSection.vue'
import LoveRiddlesSection from './components/sections/LoveRiddlesSection.vue'
import SkillsSection from './components/sections/SkillsSection.vue'
import BackgroundAnimation from './components/layout/BackgroundAnimation.vue'
import LightBackground from './components/layout/LightBackground.vue'

// 最終更新日
const lastUpdated = '2025年4月18日'
const currentTheme = ref('light')
const darkBackgroundRef = ref<InstanceType<typeof BackgroundAnimation> | null>(
  null,
)
const lightBackgroundRef = ref<InstanceType<typeof LightBackground> | null>(
  null,
)
const showOnlyBackground = ref(false) // 背景のみ表示モード

// 背景のみ表示モードを切り替える関数
const toggleBackgroundOnlyMode = () => {
  showOnlyBackground.value = !showOnlyBackground.value

  // 8秒後に自動的に戻す
  if (showOnlyBackground.value) {
    setTimeout(() => {
      showOnlyBackground.value = false
    }, 8000)
  }
}

// 背景アニメーション機能を子コンポーネントに提供
provide('backgroundAnimation', {
  // 共通
  showOnlyBackgroundView: () => toggleBackgroundOnlyMode(),
  // ダークモード用
  launchRocket: () => darkBackgroundRef.value?.launchRocket(),
  // ライトモード用
  applyWind: () => lightBackgroundRef.value?.applyWind(),
  applyLightning: () => lightBackgroundRef.value?.applyLightning(),
  // 現在のテーマ取得
  getCurrentTheme: () => currentTheme.value,

  // 統一的なアイコンクリックハンドラ
  handleIconClick: (actionId: string) => {
    console.log(`Icon clicked: ${actionId}`)

    // 現在のテーマに応じたアクションを実行
    if (currentTheme.value === 'dark') {
      // ダークテーマでのアクション
      switch (actionId) {
        case 'showBackground':
          toggleBackgroundOnlyMode()
          break
        case 'rocket':
          darkBackgroundRef.value?.launchRocket()
          break
        // 他のダークモードアクションをここに追加
      }
    } else {
      // ライトテーマでのアクション
      switch (actionId) {
        case 'showBackground':
          toggleBackgroundOnlyMode()
          break
        case 'wind':
          lightBackgroundRef.value?.applyWind()
          break
        case 'lightning':
          lightBackgroundRef.value?.applyLightning()
          break
        // 他のライトモードアクションをここに追加
      }
    }
  },
})

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem('theme', currentTheme.value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})
</script>

<template>
  <div class="app">
    <LightBackground 
      v-if="currentTheme === 'light'" 
      ref="lightBackgroundRef" 
      class="background-layer" 
    />
    <BackgroundAnimation 
      v-else 
      ref="darkBackgroundRef" 
      class="background-layer" 
    />
    <!-- 背景のみモード表示時はコンテンツを非表示 -->
    <div
      v-if="!showOnlyBackground"
      class="content-container"
      :class="{ 'fade-out': showOnlyBackground }"
    >
      <TheHeader />

      <main>
        <section id="about" class="section alternate">
          <AboutSection />
        </section>

        <section id="works" class="section alternate">
          <WorksSection />
        </section>

        <section id="love-riddles" class="section alternate">
          <LoveRiddlesSection />
        </section>

        <section id="skills" class="section alternate">
          <SkillsSection />
        </section>
      </main>

      <!-- フッターを追加 -->
      <footer class="footer">
        <div class="footer-content">
          <p>© 2025 Pina641</p>
          <p class="last-updated">最終更新日: {{ lastUpdated }}</p>
        </div>
      </footer>
    </div>

    <!-- 背景観測モード時のコントロール -->
    <div
      v-if="showOnlyBackground"
      class="background-controls"
      @click="showOnlyBackground = false"
    >
      <div class="background-tooltip">
        画面をクリックするとコンテンツに戻ります
      </div>
    </div>

    <button class="theme-toggle-btn" @click="toggleTheme">
      <span v-if="currentTheme === 'light'">🌙</span>
      <span v-else>☀️</span>
    </button>
  </div>
</template>

<style>
body {
  font-family: 'Roboto', sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.6;
  transition:
    background-color 0.3s,
    color 0.3s;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app {
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
}

/* 背景レイヤーとコンテンツレイヤーの重なり順を制御 */
.background-layer {
  z-index: 1; /* 背景は下の層に */
  pointer-events: auto; /* イベントを受け取れるようにする */
}

.content-container {
  position: relative;
  z-index: 5; /* コンテンツは上の層に */
  pointer-events: none; /* イベントを透過させる */
}

/* コンテンツ内の操作可能な要素だけイベントを受け取れるようにする */
.content-container a,
.content-container button,
.content-container input,
.content-container select,
.content-container textarea,
.content-container .interactive {
  pointer-events: auto;
}

main {
  padding: 4rem 0;
}

.section {
  padding: var(--section-padding);
  border-radius: 12px;
  margin-bottom: 4rem;
  background-color: var(--section-background-color);
  transition:
    background-color 0.3s,
    box-shadow 0.3s;
}

.alternate {
  background-color: var(--alternate-section-background-color);
}

h1,
h2,
h3 {
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

h1 {
  font-size: 2.5rem;
}

h2 {
  font-size: 2rem;
  text-align: center;
  position: relative;
  padding-bottom: 1rem;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: var(--accent-color);
  border-radius: 2px;
}

p {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .section {
    padding: 2rem 1rem;
  }
}

/* フッタースタイルを追加 */
.footer {
  margin-top: 3rem;
  padding: 2rem;
  background-image: linear-gradient(
    to right,
    var(--primary-color),
    var(--secondary-color)
  );
  border-radius: 10px 10px 0 0;
  color: white;
  text-align: center;
}

.footer-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.last-updated {
  font-style: italic;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}

.theme-toggle-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--header-background-color);
  color: var(--text-color);
  border: 2px solid var(--primary-color);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1000;
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px var(--primary-color);
}

/* 背景のみモード関連のスタイル */
.content-container {
  transition: opacity 0.5s ease;
}

.fade-out {
  opacity: 0;
}
.content-container {
  transition: opacity 0.5s ease;
}

.fade-out {
  opacity: 0;
}

.background-controls {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 100;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 2rem;
}

.background-tooltip {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  animation: fade-in-out 2s ease infinite alternate;
}

@keyframes fade-in-out {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}
</style>
