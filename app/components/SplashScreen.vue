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
        <div class="receipt-tear top"></div>
        <div class="splash-content">
          <div class="logo-wrapper">
            <span class="logo-pulse"></span>
            <img :src="logoSrc" alt="PO Monitor Logo" class="logo" />
          </div>
          <div class="brand-block">
            <p class="brand">PO MONITOR</p>
            <p class="tagline">Preparing your dashboard</p>
            <p class="meta">Login ticket · {{ new Date().toLocaleTimeString() }}</p>
          </div>
          <div class="progress">
            <span class="progress-bar"></span>
          </div>
        </div>
        <div class="receipt-tear bottom"></div>
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
  background: linear-gradient(145deg, #fff8fa, #f6f1f3);
  backdrop-filter: blur(3px);
}

.splash-screen::before,
.splash-screen::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  filter: blur(0);
  opacity: 0.35;
  animation: float 6s ease-in-out infinite;
}

.splash-screen::before {
  width: 220px;
  height: 220px;
  top: 15%;
  right: 20%;
  background: rgba(238, 105, 131, 0.12);
}

.splash-screen::after {
  width: 160px;
  height: 160px;
  bottom: 18%;
  left: 18%;
  background: rgba(0, 0, 0, 0.04);
  animation-delay: 1.2s;
}

.splash-panel {
  position: relative;
  padding: 3rem 3.5rem;
  border-radius: 2rem;
  background: #ffffff;
  border: 1px dashed #f0c8d3;
  box-shadow: 0 26px 60px rgba(238, 105, 131, 0.2);
  backdrop-filter: blur(6px);
  overflow: hidden;
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
  background: #fff7fa;
  box-shadow: 0 20px 45px rgba(238, 105, 131, 0.18);
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
  border: 1px solid rgba(238, 105, 131, 0.3);
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
  color: #e44f73;
}

.tagline {
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  color: #7f7f8c;
}

.meta {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: #a3a3ad;
}

.progress {
  position: relative;
  width: 160px;
  height: 4px;
  border-radius: 999px;
  background: rgba(238, 105, 131, 0.12);
  overflow: hidden;
}

.progress-bar {
  position: absolute;
  inset: 0;
  width: 60%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f7c8d6, #ee6983);
  animation: progress 1.5s ease-in-out infinite;
}

.receipt-tear {
  width: 100%;
  height: 12px;
  background:
    radial-gradient(circle at 12px 6px, transparent 6px, #f6d9e2 6px, #f6d9e2 7px, transparent 7px) left/24px 12px repeat-x,
    linear-gradient(to right, transparent 0, transparent 100%);
}

.receipt-tear.top {
  margin: 0 -3.5rem 1rem;
}

.receipt-tear.bottom {
  margin: 1rem -3.5rem 0;
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
