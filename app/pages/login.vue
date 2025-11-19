<template>
    <main
        class="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-50 px-4 py-12">
        <div class="w-full max-w-md space-y-8">
            <div class="space-y-3 text-center">
                <div
                    class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <img src="/bill.png" alt="PO Monitor Logo" class="h-10 w-10 object-contain" />
                </div>
                <p class="text-[0.7rem] font-semibold uppercase tracking-[0.6em] text-neutral-400">PO Monitor</p>
                <h1 class="text-3xl font-bold text-neutral-900">Sign in</h1>
                <p class="text-sm text-neutral-500">Enter your Employee ID and password.</p>
            </div>

            <form class="space-y-5 rounded-2xl border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur"
                @submit.prevent="handleLogin">
                <label class="block space-y-2 text-sm font-semibold text-neutral-700">
                    Employee ID
                    <input id="employeeId" v-model="employeeId" type="text" autocomplete="username"
                        placeholder="e.g. EMP001234"
                        class="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
                </label>

                <label class="block space-y-2 text-sm font-semibold text-neutral-700">
                    Password
                    <input id="password" v-model="password" type="password" autocomplete="current-password"
                        placeholder="••••••••"
                        class="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10" />
                </label>

                <p v-if="errorMessage" class="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
                    {{ errorMessage }}
                </p>

                <button type="submit" :disabled="!canSubmit || isSubmitting"
                    class="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-900 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-400">
                    <span v-if="!isSubmitting">Sign in</span>
                    <span v-else class="flex items-center gap-2">
                        <svg class="h-4 w-4 animate-spin text-white/80" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Signing in...
                    </span>
                </button>
            </form>

            <p class="text-center text-xs uppercase tracking-[0.35em] text-neutral-400">Version 2025.2</p>
        </div>
    </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
    layout: false,
})

const router = useRouter()
const { apiPublic } = useApi()
const authCookie = useCookie('po-auth', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
})
const employeeId = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const canSubmit = computed(() => employeeId.value.trim() !== '' && password.value.trim() !== '')

const handleLogin = async () => {
    if (!canSubmit.value || isSubmitting.value) return
    errorMessage.value = ''
    isSubmitting.value = true

    try {
        const response: any = await apiPublic.post('/auth/login', {
            userId: employeeId.value.trim(),
            password: password.value,
        })

        if (!response?.success || !response?.data) {
            throw new Error(response?.message || 'Invalid credentials')
        }

        authCookie.value = {
            ...response.data,
            issuedAt: Date.now(),
        }

        await router.push('/dashboard')
    } catch (error: any) {
        console.error(error)
        errorMessage.value =
            error?.message === 'Failed to fetch'
                ? 'Network error. Please try again.'
                : error?.message || 'Unable to sign in. Please check your credentials.'
    } finally {
        isSubmitting.value = false
    }
}
</script>
