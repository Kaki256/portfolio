<script setup lang="ts">
defineProps<{
  active?: boolean
}>()
</script>

<template>
  <button :class="['base-button', { active }]">
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  background-color: var(--button-background-color);
  border: 2px solid var(--secondary-color);
  color: var(--button-text-color);
  padding: 0.5rem 1.2rem;
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-ease-in-out);
}

.base-button.active,
.base-button:hover {
  background-color: var(--button-hover-background-color);
  color: var(--button-hover-text-color);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

@media (max-width: 768px) {
  .base-button {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
