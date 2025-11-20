<template>
    <main
        class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50 px-4 py-12">
        <div class="w-full max-w-md space-y-7">
            <div class="space-y-3 text-center">
                <div
                    class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-100 bg-white shadow-sm shadow-primary-50">
                    <img src="/bill.png" alt="PO Monitor Logo" class="h-10 w-10 object-contain" />
                </div>
                <p class="text-[0.65rem] font-semibold uppercase tracking-[0.55em] text-primary-400">PO Monitor</p>
                <h1 class="text-3xl font-bold text-neutral-900">Sign in</h1>
                <p class="text-sm text-neutral-500">Welcome back. Use your Employee ID and password.</p>
            </div>

            <div class="receipt-card rounded-[20px] border border-primary-100 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(238,105,131,0.6)]">
                <div class="flex items-center justify-between text-[11px] text-neutral-500">
                    <span class="font-semibold text-neutral-700">Login receipt</span>
                    <span>{{ printedAt }}</span>
                </div>
                <div class="receipt-tear my-3"></div>
                <form class="space-y-5" @submit.prevent="handleLogin">
                    <label class="block space-y-2 text-sm font-semibold text-neutral-700">
                        Employee ID
                        <input id="employeeId" v-model="employeeId" type="text" autocomplete="username"
                            placeholder="e.g. EMP001234"
                            class="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                    </label>

                    <label class="block space-y-2 text-sm font-semibold text-neutral-700">
                        Password
                        <input id="password" v-model="password" type="password" autocomplete="current-password"
                            placeholder="••••••••"
                            class="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                    </label>

                    <p v-if="errorMessage" class="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
                        {{ errorMessage }}
                    </p>

                    <button type="submit" :disabled="!canSubmit || isSubmitting"
                        class="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary-500 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-neutral-300">
                        <span v-if="!isSubmitting">Sign in</span>
                        <span v-else class="flex items-center gap-2">
                            <svg class="h-4 w-4 animate-spin text-white/90" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Signing in...
                        </span>
                    </button>
                </form>
                <div class="receipt-tear my-3"></div>
                <div class="flex items-center justify-between text-[11px] text-neutral-500">
                    <span>PO-Monitor • Internal use</span>
                    <span>Ver 2025.2</span>
                </div>
            </div>

            <p class="text-center text-xs uppercase tracking-[0.35em] text-primary-400">Safe and secure access</p>
        </div>
    </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

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
const printedAt = computed(() =>
    new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date()),
)

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

        await Swal.fire({
            title: 'Signed in',
            text: 'Welcome to PO Monitor.',
            icon: 'success',
            confirmButtonColor: '#ee6983',
            confirmButtonText: 'Continue',
        })

        await router.push('/dashboard')
    } catch (error: any) {
        console.error(error)
        errorMessage.value =
            error?.message === 'Failed to fetch'
                ? 'Network error. Please try again.'
                : error?.message || 'Unable to sign in. Please check your credentials.'
        Swal.fire({
            title: 'Sign in failed',
            text: errorMessage.value,
            icon: 'error',
            confirmButtonColor: '#ee6983',
        })
    } finally {
        isSubmitting.value = false
    }
}
</script>

<style scoped>
.receipt-tear {
    height: 12px;
    background:
        radial-gradient(circle at 12px 6px, transparent 6px, #f2d5dd 6px, #f2d5dd 7px, transparent 7px) left/24px 12px repeat-x,
        linear-gradient(to right, transparent 0, transparent 100%);
}

.receipt-card {
    position: relative;
    background-image: radial-gradient(circle at 1px 1px, rgba(238, 105, 131, 0.03) 1px, transparent 0);
    background-size: 12px 12px;
}

.receipt-card::before,
.receipt-card::after {
    content: '';
    position: absolute;
    top: 14px;
    bottom: 14px;
    width: 10px;
    background: radial-gradient(circle at 5px 8px, transparent 6px, #ffffff 6px, #ffffff 7px, transparent 7px) center/10px 18px repeat-y;
    pointer-events: none;
}

.receipt-card::before {
    left: -6px;
}

.receipt-card::after {
    right: -6px;
}
</style>
