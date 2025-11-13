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

const { apiPublic } = useApi()
const selectedDate = ref(new Date())
const isCalendarLoading = ref(false)

const poEvents = ref<CalendarEvent[]>([])

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
