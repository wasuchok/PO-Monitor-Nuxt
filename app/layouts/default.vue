<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900">
    <AppHeader />
    <main class="mx-auto flex w-full  flex-col gap-6 px-4 py-4">
      <slot />
    </main>
    <SplashScreen :show="showSplash" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppHeader from '@/components/Header/index.vue'
import SplashScreen from '@/components/SplashScreen.vue'

const showSplash = ref(true)
let hideTimer

onMounted(() => {
  hideTimer = setTimeout(() => {
    showSplash.value = false
  }, 1200)
})

onBeforeUnmount(() => {
  if (hideTimer) {
    clearTimeout(hideTimer)
  }
})
</script>
