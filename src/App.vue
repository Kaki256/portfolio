<script setup lang="ts">
import TheHeader from './components/layout/TheHeader.vue'
import AboutSection from './components/sections/AboutSection.vue'
import WorksSection from './components/sections/WorksSection.vue'
import LoveRiddlesSection from './components/sections/LoveRiddlesSection.vue'
import SkillsSection from './components/sections/SkillsSection.vue'

// 最終更新日
const lastUpdated = '2025年4月18日'
</script>

<template>
  <div class="app">
    <TheHeader />

    <main>
      <section
        id="about"
        class="section"
      >
        <AboutSection />
      </section>

      <section
        id="works"
        class="section alternate"
      >
        <WorksSection />
      </section>

      <section
        id="love-riddles"
        class="section"
      >
        <LoveRiddlesSection />
      </section>

      <section
        id="skills"
        class="section"
      >
        <SkillsSection />
      </section>
    </main>

    <!-- フッターを追加 -->
    <footer class="footer">
      <div class="footer-content">
        <p>© 2025 Pina641</p>
        <p class="last-updated">
          最終更新日: {{ lastUpdated }}
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
:root {
  --primary-color: #00b894;
  --secondary-color: #00cec9;
  --accent-color: #fdcb6e;
  --text-color: #2d3436;
  --background-color: #f5f6fa;
  --section-padding: 4rem 2rem;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Roboto', sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.6;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
}

main {
  padding: 2rem 0;
}

.section {
  padding: var(--section-padding);
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.alternate {
  background-color: rgba(0, 184, 148, 0.05);
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
</style>
