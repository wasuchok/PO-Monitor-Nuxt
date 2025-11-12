<template>
    <header class="bg-primary-700 p-1 text-white shadow">
        <div class="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                    <img src="/bill.png" alt="โลโก้" class="h-6 w-6 object-contain" />
                </div>
                <div>
                    <p class="text-sm uppercase tracking-[0.3em] text-white/80">PO Monitor</p>
                </div>
            </div>

            <nav class="hidden md:flex items-center gap-1 flex-1 justify-center">
                <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" :class="[
                    'flex items-center gap-2 px-4 py-2 transition-colors',
                    item.rounded || '',
                    isActive(item.to)
                        ? 'bg-white text-primary-700 shadow'
                        : 'bg-white/10 text-white/80 hover:text-white hover:bg-white/20'
                ]">
                    <Icon size="16" :name="item.icon" />
                    <span class="text-sm">{{ item.label }}</span>
                </RouterLink>
            </nav>

            <div class="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end">
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
const route = useRoute()

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
</script>
