<template>
    <header class="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 p-1 text-white shadow">
        <div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-2 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                        <img src="/bill.png" alt="โลโก้" class="h-6 w-6 object-contain" />
                    </div>
                    <div>
                        <p class="text-sm uppercase tracking-[0.3em] text-white/80">PO Monitor</p>
                    </div>
                </div>
                <button
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white md:hidden"
                    type="button" @click="toggleMobileNav" aria-label="Toggle navigation">
                    <Icon :name="isMobileNavOpen ? 'material-symbols:close-rounded' : 'material-symbols:menu-rounded'"
                        size="20" />
                </button>
            </div>

            <nav :class="[
                'items-center gap-1 transition-all duration-200',
                isMobileNavOpen ? 'flex flex-col rounded-2xl bg-white/10 p-2 md:flex-row md:bg-transparent' : 'hidden md:flex',
                'md:flex-1 md:justify-center'
            ]">
                <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" :class="[
                    'flex w-full items-center gap-2 px-4 py-2 transition-colors md:w-auto',
                    item.rounded || '',
                    isActive(item.to)
                        ? 'bg-white text-primary-700 shadow'
                        : 'bg-white/10 text-white/80 hover:text-white hover:bg-white/20'
                ]">
                    <Icon size="16" :name="item.icon" />
                    <span class="text-sm">{{ item.label }}</span>
                </RouterLink>
            </nav>

            <div class="flex flex-col gap-3 md:flex-1 md:flex-row md:items-center md:justify-end">
                <div class="flex items-center gap-3">
                    <div class="text-right text-sm leading-tight">
                        <p class="font-semibold">Wasuchok Jainam</p>
                    </div>
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                        AD
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, watch } from 'vue'

const route = useRoute()
const isMobileNavOpen = ref(false)

const navItems = [
    {
        to: '/dashboard',
        label: 'Dashboard',
        icon: 'streamline-ultimate:gauge-dashboard-bold',
        rounded: 'rounded-l-lg',
    },
    {
        to: '/calender',
        label: 'Calender',
        icon: 'pixel:calender-solid',
    },
]

const isActive = (path) => route.path.startsWith(path)
const toggleMobileNav = () => {
    isMobileNavOpen.value = !isMobileNavOpen.value
}

watch(
    () => route.path,
    () => {
        isMobileNavOpen.value = false
    }
)
</script>
