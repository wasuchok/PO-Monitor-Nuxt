<template>
  <transition name="splash-fade">
    <div
      v-if="show"
      class="splash-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading PO Monitor"
    >
      <article class="splash-panel">
        <div class="splash-content">
          <div class="logo-wrapper">
            <span class="logo-pulse"></span>
            <img :src="logoSrc" alt="PO Monitor Logo" class="logo" />
          </div>
          <div class="brand-block">
            <p class="brand">PO MONITOR</p>
            <p class="tagline">Preparing your dashboard</p>
          </div>
          <div class="progress">
            <span class="progress-bar"></span>
          </div>
        </div>
      </article>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  logoSrc: {
    type: String,
    default: '/bill.png',
  },
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.15), transparent 55%),
    linear-gradient(125deg, rgba(255, 245, 247, 0.96), rgba(238, 105, 131, 0.98));
  backdrop-filter: blur(6px);
}

.splash-screen::before,
.splash-screen::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  filter: blur(0);
  opacity: 0.5;
  animation: float 6s ease-in-out infinite;
}

.splash-screen::before {
  width: 220px;
  height: 220px;
  top: 15%;
  right: 20%;
  background: rgba(255, 255, 255, 0.25);
}

.splash-screen::after {
  width: 160px;
  height: 160px;
  bottom: 18%;
  left: 18%;
  background: rgba(255, 255, 255, 0.18);
  animation-delay: 1.2s;
}

.splash-panel {
  position: relative;
  padding: 3rem 3.5rem;
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 35px 80px rgba(238, 105, 131, 0.4);
  backdrop-filter: blur(12px);
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.logo-wrapper {
  position: relative;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.logo-pulse {
  position: absolute;
  inset: 6px;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  animation: pulse 1.8s ease-in-out infinite;
}

.brand-block {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.brand {
  font-size: 0.75rem;
  letter-spacing: 0.55em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.tagline {
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.8);
}

.progress {
  position: relative;
  width: 160px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.progress-bar {
  position: absolute;
  inset: 0;
  width: 60%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.9));
  animation: progress 1.5s ease-in-out infinite;
}

.splash-fade-enter-active,
.splash-fade-leave-active {
  transition: opacity 0.4s ease;
}

.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
}

@keyframes progress {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(-10%);
  }
  100% {
    transform: translateX(110%);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(15px);
  }
}
</style>
