<template>
    <section lang="th" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-4">
            <ClientOnly>
                <div class="relative rounded-md bg-white p-1 shadow-sm  lg:col-span-3 lg:p-2 is-light-mode">
                    <Qalendar class="min-h-[80vh]" :events="poEvents" :config="calendarConfig"
                        :selected-date="selectedDate" :is-loading="isCalendarLoading"
                        @updated-period="handlePeriodChange" @event-was-clicked="handleEventClick" />
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
                        <article v-for="(entry, index) in upcomingEntries" :key="entry.po_no ?? `upcoming-${index}`"
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

        <Teleport to="body">
            <div v-if="isDetailModalOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
                @click.self="closeDetailModal">
                <div class="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl lg:p-8">
                    <div class="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 pb-4">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">รายละเอียด PO
                            </p>
                            <p class="text-2xl font-bold text-neutral-900">
                                {{ activePoNumber || detailHeader?.po_no || '-' }}
                            </p>
                            <p v-if="detailHeader?.vendor_name"
                                class="mt-1 text-sm font-medium text-neutral-500 lg:text-base">
                                {{ detailHeader.vendor_name }}
                            </p>
                        </div>
                        <button type="button"
                            class="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-800"
                            @click="closeDetailModal">
                            ปิดหน้าต่าง
                        </button>
                    </div>

                    <div class="py-6">
                        <div v-if="isDetailLoading" class="py-8 text-center text-sm text-neutral-500">
                            กำลังโหลดรายละเอียด...
                        </div>
                        <div v-else-if="detailErrorMessage" class="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                            {{ detailErrorMessage }}
                        </div>
                        <div v-else-if="!poDetailEntries.length"
                            class="rounded-xl bg-neutral-50 p-4 text-center text-sm text-neutral-500">
                            ไม่มีข้อมูลรายการสำหรับ PO นี้
                        </div>
                        <div v-else class="space-y-6">
                            <div class="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
                                <div>
                                    <p class="text-neutral-400">วันที่ออก PO</p>
                                    <p class="font-semibold text-neutral-900">{{ formatThaiDate(detailHeader?.po_date)
                                        }}</p>
                                </div>
                                <div>
                                    <p class="text-neutral-400">กำหนดส่งของ</p>
                                    <p class="font-semibold text-neutral-900">{{
                                        formatThaiDate(detailHeader?.arrival_date)
                                    }}</p>
                                </div>
                                <div>
                                    <p class="text-neutral-400">PR Number</p>
                                    <p class="font-semibold text-neutral-900">{{ detailHeader?.pr_number || '-' }}</p>
                                </div>
                                <div>
                                    <p class="text-neutral-400">สถานที่</p>
                                    <p class="font-semibold text-neutral-900">{{ detailHeader?.location || '-' }}</p>
                                </div>
                                <div>
                                    <p class="text-neutral-400">Reference</p>
                                    <p class="font-semibold text-neutral-900">{{ detailHeader?.reference || '-' }}</p>
                                </div>
                                <div>
                                    <p class="text-neutral-400">เงื่อนไขการชำระเงิน</p>
                                    <p class="font-semibold text-neutral-900">{{ detailHeader?.term_desc || '-' }}</p>
                                </div>
                            </div>

                            <div>
                                <p class="mb-3 text-sm font-semibold text-neutral-700">รายการสินค้า</p>
                                <div class="overflow-x-auto rounded-2xl border border-neutral-100">
                                    <table class="min-w-full divide-y divide-neutral-100 text-sm">
                                        <thead
                                            class="bg-neutral-50 text-left text-[13px] uppercase tracking-wide text-neutral-400">
                                            <tr>
                                                <th class="px-4 py-3 font-semibold">รายการ</th>
                                                <th class="px-4 py-3 font-semibold">จำนวน</th>
                                                <th class="px-4 py-3 font-semibold">หน่วย</th>
                                                <th class="px-4 py-3 font-semibold">ราคาต่อหน่วย</th>
                                                <th class="px-4 py-3 font-semibold">ยอดสุทธิ</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-neutral-100 text-neutral-700">
                                            <tr v-for="detail in poDetailEntries"
                                                :key="`${detail.po_no}-${detail.po_row ?? detail.item_no}`">
                                                <td class="px-4 py-3">
                                                    <p class="font-semibold text-neutral-900">{{ detail.item_desc ||
                                                        'ไม่ระบุ' }}</p>
                                                    <p class="text-xs text-neutral-400">{{ detail.item_no || '-' }}</p>
                                                </td>
                                                <td class="px-4 py-3">{{ detail.qty_order ?? '-' }}</td>
                                                <td class="px-4 py-3">{{ detail.order_unit || '-' }}</td>
                                                <td class="px-4 py-3">{{ formatCurrency(detail.unit_cost) }}</td>
                                                <td class="px-4 py-3 font-semibold text-neutral-900">{{
                                                    formatCurrency(detail.after_discount ?? detail.amount) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="grid gap-4 text-sm sm:grid-cols-3">
                                <div class="rounded-2xl bg-neutral-50 p-4">
                                    <p class="text-xs uppercase text-neutral-400">ยอดก่อนภาษี</p>
                                    <p class="text-lg font-semibold text-neutral-900">{{
                                        formatCurrency(detailHeader?.tax_base)
                                    }}</p>
                                </div>
                                <div class="rounded-2xl bg-neutral-50 p-4">
                                    <p class="text-xs uppercase text-neutral-400">ภาษี</p>
                                    <p class="text-lg font-semibold text-neutral-900">{{
                                        formatCurrency(detailHeader?.tax) }}
                                    </p>
                                </div>
                                <div class="rounded-2xl bg-primary-50 p-4">
                                    <p class="text-xs uppercase text-neutral-500">ยอดรวมสุทธิ</p>
                                    <p class="text-lg font-semibold text-primary-600">{{
                                        formatCurrency(detailHeader?.total) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </section>
</template>

<script setup lang="ts">
import { Qalendar } from 'qalendar'
import { computed, ref, watch } from 'vue'

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

type PoDetailEntry = {
    po_no?: string
    po_row?: number
    po_date?: string
    arrival_date?: string
    pr_number?: string
    vendor_id?: string
    vendor_name?: string
    location?: string
    description?: string
    reference?: string
    tax_group_name?: string
    tax_base?: number
    tax?: number
    total?: number
    item_no?: string
    item_desc?: string
    qty_order?: number
    order_unit?: string
    unit_cost?: number
    amount?: number
    after_discount?: number
    division?: string
    term_desc?: string
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
const currencyFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
})

const { apiPublic } = useApi()
const selectedDate = ref(new Date())
const isCalendarLoading = ref(false)
const isDetailModalOpen = ref(false)
const isDetailLoading = ref(false)
const activePoNumber = ref('')
const detailErrorMessage = ref<string | null>(null)
const poDetailEntries = ref<PoDetailEntry[]>([])

const poEvents = ref<CalendarEvent[]>([])
const upcomingEntries = ref<CalendarEntry[]>([])

const detailHeader = computed(() => poDetailEntries.value[0] ?? null)

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

const fetchPoDetail = async (po_number: string) => {
    if (!po_number) return

    activePoNumber.value = po_number
    isDetailModalOpen.value = true
    isDetailLoading.value = true
    detailErrorMessage.value = null
    poDetailEntries.value = []

    try {
        const response = await apiPublic.get<PoDetailEntry[]>(`/z_po_pl_po/detail/${po_number}`)
        const detailItems = Array.isArray(response?.data) ? response.data : []
        poDetailEntries.value = detailItems
        console.log(detailItems)
        if (detailItems.length === 0) {

            detailErrorMessage.value = 'ไม่พบรายละเอียดของ PO นี้'
        }
    } catch (error) {
        console.error('Unable to load PO detail', error)
        detailErrorMessage.value = 'ไม่สามารถโหลดรายละเอียด PO ได้ กรุณาลองใหม่'
    } finally {
        isDetailLoading.value = false
    }
}

const handleEventClick = (eventData: any) => {
    const poNumber = eventData?.clickedEvent?.id
    if (!poNumber) return
    fetchPoDetail(String(poNumber))
};

const closeDetailModal = () => {
    isDetailModalOpen.value = false
    activePoNumber.value = ''
    poDetailEntries.value = []
    detailErrorMessage.value = null
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

const formatCurrency = (value?: number | null) => {
    if (typeof value !== 'number') return '-'
    return currencyFormatter.format(value)
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
