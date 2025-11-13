<template>
    <section lang="th" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-4">
            <ClientOnly>
                <div class="relative rounded-md bg-white p-1 shadow-sm  lg:col-span-3 lg:p-2 is-light-mode">
                    <Qalendar class="min-h-[80vh]" :events="poEvents" :config="calendarConfig"
                        :selected-date="selectedDate" :is-loading="isCalendarLoading"
                        @updated-period="handlePeriodChange" />
                    <div v-if="isCalendarLoading"
                        class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/80">
                        <span class="text-sm font-semibold text-neutral-500">กำลังโหลดข้อมูล...</span>
                    </div>
                </div>
            </ClientOnly>

            <aside class="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">รายการถัดไป</p>
                        <p class="text-xs text-neutral-400">PO ที่กำลังจะถึง 5 รายการ</p>
                    </div>
                    <button class="text-xs font-semibold text-primary-500 hover:text-primary-600"
                        @click="selectedDate = new Date()">
                        กลับไปวันนี้
                    </button>
                </div>
                <div class="space-y-4">
                    <div v-if="upcomingEntries.length" class="space-y-3">
                        <article v-for="(entry, index) in upcomingEntries"
                            :key="entry.po_no ?? `upcoming-${index}`"
                            class="flex flex-col gap-2 rounded-xl border border-neutral-100 p-3 shadow-sm ring-1 ring-black/5 transition hover:border-primary-200">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-semibold text-neutral-700">{{ entry.po_no || 'PO -' }}</p>
                                <span class="text-[11px] font-semibold text-primary-500">
                                    {{ getStatusLabel(entry.status) }}
                                </span>
                            </div>
                            <p class="text-xs text-neutral-500">
                                <span class="font-medium text-neutral-700">{{ formatThaiDate(entry.po_date) }}</span>
                                <span class="text-neutral-300">•</span>
                                <span class="text-neutral-500">{{ entry.division || 'ทุก Division' }}</span>
                            </p>
                        </article>
                    </div>
                    <div v-else
                        class="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center text-xs text-neutral-400">
                        ยังไม่มีรายการกำลังจะถึง
                    </div>
                </div>
            </aside>
        </div>
    </section>
</template>

<script setup lang="ts">
import { Qalendar } from 'qalendar'
import { ref, watch } from 'vue'

interface CalendarEvent {
    id: number | string
    title: string
    time: { start: string; end: string }
    description?: string
    color?: 'blue' | 'yellow' | 'green' | 'red' | 'purple'
}

type CalendarEntry = {
    po_no: string
    po_date: string
    division?: string | null
    status?: number | null
}

type CalendarApiResponse = {
    data?: CalendarEntry[]
}

type QalendarPeriodPayload = {
    start?: Date
    end?: Date
    selectedDate: Date
}

const STATUS_LABEL_LOOKUP: Record<number, string> = {
    1: 'Draft',
    2: 'Partial',
    3: 'Completed',
}

const STATUS_COLOR_LOOKUP: Record<number, CalendarEvent['color']> = {
    1: 'yellow',
    2: 'blue',
    3: 'green',
}
const MAX_UPCOMING_ITEMS = 5
const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
})

const { apiPublic } = useApi()
const selectedDate = ref(new Date())
const isCalendarLoading = ref(false)

const poEvents = ref<CalendarEvent[]>([])
const upcomingEntries = ref<CalendarEntry[]>([])

const getStatusLabel = (status?: number | null) =>
    STATUS_LABEL_LOOKUP[status ?? 0] ?? 'Unknown'

const resolveEventColor = (status?: number | null) =>
    STATUS_COLOR_LOOKUP[status ?? 0] ?? 'purple'

const normalizeEventDate = (dateString: string) => {
    const safeDate = dateString || selectedDate.value.toISOString().slice(0, 10)
    return {
        start: safeDate,
        end: safeDate,
    }
}

const fetchCalendarEntries = async (date: Date = selectedDate.value) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return

    const month = date.getMonth() + 1
    const year = date.getFullYear()

    isCalendarLoading.value = true
    try {
        const response = await apiPublic.get<CalendarApiResponse>('/po/calendar', {
            params: {
                month,
                year,
                perPage: 0,
            },
        })

        const entries = Array.isArray(response?.data) ? response.data : []
        updateUpcomingEntries(entries)
        poEvents.value = entries
            .filter((entry) => Boolean(entry.po_date))
            .map((entry, index) => {
                const time = normalizeEventDate(entry.po_date)
                const statusLabel = getStatusLabel(entry.status)

                return {
                    id: entry.po_no ?? `po-${index}`,
                    title: entry.po_no
                        ? `${entry.po_no}${entry.division ? ` (${entry.division})` : ''}`
                        : `PO ${index + 1}`,
                    time,
                    description: [statusLabel, entry.division ? `Division: ${entry.division}` : null]
                        .filter(Boolean)
                        .join(' | '),
                    color: resolveEventColor(entry.status),
                }
            })
    } catch (error) {
        console.error('Unable to load PO calendar', error)
        poEvents.value = []
    } finally {
        isCalendarLoading.value = false
    }
}

const updateUpcomingEntries = (entries: CalendarEntry[]) => {
    if (!Array.isArray(entries) || entries.length === 0) {
        upcomingEntries.value = []
        return
    }

    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const sorted = entries
        .map((entry) => ({
            entry,
            date: entry.po_date ? new Date(entry.po_date) : null,
        }))
        .filter(({ date }) => date instanceof Date && !Number.isNaN(date.getTime()) && date >= startOfToday)
        .sort((a, b) => {
            if (!a.date || !b.date) return 0
            return a.date.getTime() - b.date.getTime()
        })
        .slice(0, MAX_UPCOMING_ITEMS)
        .map(({ entry }) => entry)

    upcomingEntries.value = sorted
}

const formatThaiDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    const parsed = new Date(dateString)
    if (Number.isNaN(parsed.getTime())) return '-'
    return thaiDateFormatter.format(parsed)
}

watch(
    selectedDate,
    (next, previous) => {
        if (!next) return
        if (
            previous &&
            previous.getMonth() === next.getMonth() &&
            previous.getFullYear() === next.getFullYear()
        ) {
            return
        }
        fetchCalendarEntries(next)
    },
    { immediate: true },
)

const handlePeriodChange = (period: QalendarPeriodPayload) => {
    const nextDate = period?.start ?? period?.selectedDate
    if (!nextDate) return
    selectedDate.value = new Date(nextDate)
}

const calendarConfig: any = {
    locale: 'th-TH',
    defaultMode: 'month',
    disableModes: ['day'],
    week: {
        startsOn: 'monday',
        nDays: 7,
    },
    eventDialog: {
        isDisabled: true,
    },
    isSilent: true,
    style: {
        // บังคับ light mode และปรับสีพื้นหลังให้ขาว/อ่อนถ้าต้องการ
        colorSchemes: {
            default: { color: '#000', backgroundColor: '#fff' } // สีเริ่มต้นสำหรับ events
        }
    }
}
</script>
