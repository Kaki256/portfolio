<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const name = 'Pina641'
</script>

<template>
  <header class="header">
    <div class="logo">
      <h1>{{ name }}</h1>
      <p class="tagline">Developer & Riddle Enthusiast</p>
    </div>

    <button
      class="menu-toggle"
      :class="{ active: isMenuOpen }"
      @click="toggleMenu"
    >
      <span />
      <span />
      <span />
    </button>

    <nav :class="['nav', { 'nav-open': isMenuOpen }]">
      <ul class="nav-list">
        <li>
          <a href="#about" @click="isMenuOpen = false">About</a>
        </li>
        <li>
          <a href="#works" @click="isMenuOpen = false">Works</a>
        </li>
        <li>
          <a href="#love-riddles" @click="isMenuOpen = false">Love Riddles</a>
        </li>
        <li>
          <a href="#skills" @click="isMenuOpen = false">Skills</a>
        </li>
      </ul>

      <div class="social-links">
        <a
          href="https://github.com/Kaki256"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link github"
        >
          <div class="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              class="social-icon"
            >
              <path
                fill="currentColor"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"
              />
            </svg>
          </div>
          <div class="link-text">
            <span class="service-name">GitHub</span>
            <span class="user-name">@Kaki256</span>
          </div>
        </a>

        <a
          href="https://x.com/Kak1_n0_tane"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link x"
        >
          <div class="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              class="social-icon"
            >
              <path
                fill="currentColor"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </div>
          <div class="link-text">
            <span class="service-name">X</span>
            <span class="user-name">@Kak1_n0_tane</span>
          </div>
        </a>

        <a
          href="https://portfolio.trap.jp/users/Pina641"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link trap"
        >
          <div class="icon-container">
            <img
              src="/logos/traP_logo_icon.svg"
              alt="traP Logo"
              class="logo-image trap-logo"
            />
          </div>
          <div class="link-text">
            <span class="service-name">traP</span>
            <span class="user-name">@Pina641</span>
          </div>
        </a>

        <a
          href="https://atcoder.jp/users/Kaki256"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link atcoder"
        >
          <div class="icon-container">
            <img
              src="/logos/AtCoder_logo.png"
              alt="AtCoder Logo"
              class="logo-image atcoder-logo"
            />
          </div>
          <div class="link-text">
            <span class="service-name">AtCoder</span>
            <span class="user-name">@Kaki256</span>
          </div>
        </a>
      </div>
    </nav>

    <div v-if="isMenuOpen" class="nav-overlay" @click="closeMenu" />
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.5rem 2rem;
  position: relative;
  background-image: linear-gradient(
    to right,
    var(--primary-color),
    var(--secondary-color)
  );
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
  box-shadow: var(--box-shadow-md);
}

.logo {
  color: white;
}

.logo h1 {
  font-size: 2rem;
  margin: 0;
  color: white;
}

.tagline {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin: 0;
}

.nav {
  display: flex;
  align-items: center;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-list a {
  color: white;
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  padding: 0.5rem 0;
  position: relative;
  transition: var(--transition-ease-in-out);
}

.nav-list a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: var(--accent-color);
  transition: width 0.3s;
}

.nav-list a:hover::after {
  width: 100%;
}

.social-links {
  display: flex;
  gap: 0.8rem;
  margin-left: 2rem;
  flex-wrap: wrap;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: white;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.social-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: var(--transition-card-hover);
  z-index: 1;
}

.social-link:hover::before {
  left: 0;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-circle);
  background: rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
}

.social-icon {
  width: 18px;
  height: 18px;
}

.logo-image {
  width: 20px;
  height: 20px;
  object-fit: contain;
  border-radius: var(--border-radius-sm);
}

.text-logo {
  font-weight: var(--font-weight-bold);
  font-size: 12px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.trap-logo {
  filter: brightness(0) invert(1);
  width: 22px;
  height: 22px;
}

.atcoder-logo {
  width: 20px;
  height: 20px;
}

.link-text {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

.service-name {
  font-size: 0.75rem;
  opacity: 0.8;
}

.user-name {
  font-size: 0.85rem;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
}

.github {
  background-color: rgba(33, 33, 33, 0.85);
}

.x {
  background-color: rgba(0, 0, 0, 0.85);
}

.trap {
  background-color: rgba(0, 122, 255, 0.85);
}

.atcoder {
  background-color: rgba(93, 81, 241, 0.85);
}

.social-link:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-md);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.menu-toggle span {
  display: block;
  width: 100%;
  height: 3px;
  background-color: white;
  border-radius: var(--border-radius-sm);
  transition: var(--transition-ease-in-out);
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
    z-index: 1000;
  }

  .nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 70%;
    height: 100vh;
    background-color: var(--primary-color);
    padding: 6rem 2rem 2rem;
    transition: var(--transition-ease-in-out);
    z-index: 999;
  }

  .nav-open {
    right: 0;
  }

  .nav-list {
    flex-direction: column;
    gap: 1rem;
  }

  .social-links {
    margin: 2rem 0 0 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
  }

  .social-link {
    padding: 0.8rem;
    justify-content: center;
  }

  .link-text {
    display: none;
  }

  .icon-container {
    width: 40px;
    height: 40px;
  }

  .social-icon {
    width: 24px;
    height: 24px;
  }

  .logo-image {
    width: 24px;
    height: 24px;
  }

  .menu-toggle.active span:first-child {
    transform: rotate(45deg) translate(5px, 5px);
  }

  .menu-toggle.active span:nth-child(2) {
    opacity: 0;
  }

  .menu-toggle.active span:last-child {
    transform: rotate(-45deg) translate(7px, -6px);
  }

  .nav-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }
}

/* アニメーション効果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.social-links a:nth-child(1) {
  animation: fadeInUp 0.4s ease-out 0.1s forwards;
  opacity: 0;
}

.social-links a:nth-child(2) {
  animation: fadeInUp 0.4s ease-out 0.2s forwards;
  opacity: 0;
}

.social-links a:nth-child(3) {
  animation: fadeInUp 0.4s ease-out 0.3s forwards;
  opacity: 0;
}

.social-links a:nth-child(4) {
  animation: fadeInUp 0.4s ease-out 0.4s forwards;
  opacity: 0;
}
</style>
