<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900">
    <AppHeader />
    <main class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <slot />
    </main>
  </div>
</template>

<script setup>
import AppHeader from '@/components/Header/index.vue'
</script>
