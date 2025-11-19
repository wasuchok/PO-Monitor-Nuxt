<template>
    <section class="space-y-6">
        <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div class="flex flex-col gap-3 border-b border-neutral-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-neutral-400">Dashboard</p>
                    <h1 class="text-lg font-semibold text-neutral-900">PO Overview</h1>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button"
                        class="rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-300"
                        @click="resetFilters">
                        Reset filters
                    </button>
                    <button type="button"
                        class="rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-400"
                        @click="handleLogout">
                        Logout
                    </button>
                </div>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-2">
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Delivery Date</p>
                    <ClientOnly>
                        <VueDatePicker v-model="deliveryDate" model-type="yyyy-MM-dd" :enable-time-picker="false"
                            auto-apply :clearable="true" placeholder="Select delivery date" :teleport="true"
                            input-class="dp-input-sm" />
                        <template #fallback>
                            <div class="h-10 animate-pulse rounded-lg bg-neutral-100"></div>
                        </template>
                    </ClientOnly>
                </div>

                <div class="space-y-2">
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Team</p>
                    <ClientOnly>
                        <VSelect v-model="team" class="vs-select-sm" :options="teamOptions"
                            :reduce="(option) => option.value" placeholder="Select team" :clearable="true" />
                        <template #fallback>
                            <div class="h-10 animate-pulse rounded-lg bg-neutral-100"></div>
                        </template>
                    </ClientOnly>
                </div>

                <div class="space-y-2">
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Item</p>
                    <input v-model="item" type="text" placeholder="Enter product or PO"
                        class="h-9 w-full rounded-lg border border-neutral-200 px-3 text-xs text-neutral-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
                </div>
            </div>

            <ClientOnly>
                <div class="relative rounded-md  p-3">
                    <div class="mb-3 flex items-center justify-between gap-4 border-b pb-3 text-xs text-neutral-500">
                        <div class="uppercase tracking-[0.3em] text-[10px] font-semibold">Columns</div>
                        <details class="relative inline-flex">
                            <summary
                                class="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-[11px] font-semibold text-neutral-600 hover:border-neutral-300">
                                Select columns
                            </summary>
                            <div
                                class="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-neutral-200 bg-white/90 p-3 text-[11px] shadow-lg">
                                <div class="grid grid-cols-2 gap-2">
                                    <label v-for="column in tableColumns" :key="column.key"
                                        class="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-100 px-2 py-1 text-neutral-600 hover:border-neutral-200">
                                        <input type="checkbox" :value="column.key" v-model="visibleColumnKeys"
                                            class="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                                        <span>{{ column.header }}</span>
                                    </label>
                                </div>
                            </div>
                        </details>
                    </div>
                    <DataTable class="prime-po-table text-[11px] " :value="rows" :loading="isLoading" dataKey="id" lazy
                        paginator :first="firstRow" :rows="perPage" :rowsPerPageOptions="pageSizeOptions"
                        :totalRecords="totalRows" :rowHover="true" :tableStyle="{ fontSize: '0.8rem' }" scrollable
                        scrollHeight="" @page="handlePageChange">
                        <Column v-for="column in columnsToShow" :key="column.key" :field="column.field"
                            :header="column.header" :style="column.style">
                            <template v-if="column.key === 'status'" #body="{ data }">
                                <span :class="getStatusClass(data.status_label)">
                                    {{ data.status_label }}
                                </span>
                            </template>
                        </Column>
                        <template #empty>
                            <div class="flex flex-col items-center justify-center gap-2 py-16 text-neutral-500">
                                <span class="text-base font-semibold">No Data</span>
                                <p class="text-xs text-neutral-400">Try adjusting filters or reload the data.</p>
                            </div>
                        </template>
                    </DataTable>
                </div>

                <template #fallback>
                    <div
                        class="mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 p-8 text-neutral-500">
                        <span
                            class="h-8 w-8 animate-pulse rounded-full border border-neutral-300 bg-neutral-200/80"></span>
                        <p class="text-sm font-medium">Loading table...</p>
                        <p class="text-xs text-neutral-400">Data will appear automatically.</p>
                    </div>
                </template>
            </ClientOnly>
        </div>
    </section>
</template>

<script setup>
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import VSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const STATUS_LOOKUP = {
    1: 'Open',
    2: 'Approve',
    3: 'Received',
}

const tableColumns = [
    { key: 'po_no', field: 'po_no', header: 'PO No', style: 'min-width: 8rem' },
    { key: 'vendor_name', field: 'vendor_name', header: 'Vendor', style: 'min-width: 10rem' },
    { key: 'po_date', field: 'po_date', header: 'PO Date', style: 'min-width: 6.5rem' },
    { key: 'arrival_date', field: 'arrival_date', header: 'Arr Date', style: 'min-width: 6.5rem' },
    { key: 'pr_number', field: 'pr_number', header: 'PR Number', style: 'min-width: 7rem' },
    { key: 'reference', field: 'reference', header: 'Reference', style: 'min-width: 6rem' },
    { key: 'row_no', field: 'row_no', header: 'Row No', style: 'min-width: 5rem' },
    { key: 'item_no', field: 'item_no', header: 'Item No', style: 'min-width: 9rem' },
    { key: 'item_desc', field: 'item_desc', header: 'Item Description', style: 'min-width: 10rem' },
    { key: 'model', field: 'model', header: 'Model', style: 'min-width: 6.5rem' },
    { key: 'brand', field: 'brand', header: 'Brand', style: 'min-width: 6rem' },
    { key: 'oq_ordered', field: 'oq_ordered', header: 'Qty', style: 'min-width: 5rem' },
    { key: 'order_unit', field: 'order_unit', header: 'Unit', style: 'min-width: 5rem' },
    { key: 'division', field: 'division', header: 'Division', style: 'min-width: 6rem' },
    { key: 'user_create', field: 'user_create', header: 'User Create', style: 'min-width: 7rem' },
    { key: 'status', field: 'status_label', header: 'Status', style: 'min-width: 6rem' },
]

const visibleColumnKeys = ref(tableColumns.map((column) => column.key))
const columnsToShow = computed(() =>
    tableColumns.filter((column) => visibleColumnKeys.value.includes(column.key))
)

const columnStorageKey = 'dashboard-visible-columns'

const hydrateVisibleColumns = () => {
    if (!process.client) return
    try {
        const saved = localStorage.getItem(columnStorageKey)
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (!Array.isArray(parsed) || parsed.length === 0) return

        const validKeys = parsed.filter((key) =>
            tableColumns.some((column) => column.key === key)
        )

        if (validKeys.length) {
            visibleColumnKeys.value = validKeys
        }
    } catch (error) {
        console.error('Failed to load saved columns', error)
    }
}

onMounted(() => {
    hydrateVisibleColumns()
})

watch(visibleColumnKeys, (value) => {
    if (!process.client) return
    try {
        localStorage.setItem(columnStorageKey, JSON.stringify(value))
    } catch (error) {
        console.error('Failed to persist visible columns', error)
    }
})

const { apiPublic } = useApi()
const router = useRouter()

const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const deliveryDate = ref(getTodayDate())
const team = ref(null)
const item = ref('')
const rows = ref([])
const divisionOptions = ref([])
const currentPage = ref(1)
const perPage = ref(10)
const totalRows = ref(0)
const isLoading = ref(false)
const pageSizeOptions = [10, 20, 50]

let searchDebounce

const authCookie = useCookie('po-auth')

const teamOptions = computed(() => {
    const items = divisionOptions.value
    if (!authCookie.value) return []

    const mapped = items.map(({ division }) => ({
        label: `${division || '-'}`,
        value: division,
    }))

    if (authCookie.value.role === 'EMPLOYEE') {
        return mapped.filter((option) => option.value === authCookie.value.division)
    }

    return mapped
})
const firstRow = computed(() => (currentPage.value - 1) * perPage.value)
const apiFilters = computed(() => ({
    division: authCookie.value?.role === 'EMPLOYEE'
        ? authCookie.value?.division
        : team.value || undefined,
    arrivalDate: deliveryDate.value || undefined,
    itemDesc: item.value.trim() || undefined,
}))

const fetchPlPoPl = async (page = currentPage.value, pageSize = perPage.value) => {
    isLoading.value = true
    try {
        const filters = apiFilters.value

        const [response] = await Promise.all([
            apiPublic.get('/z_po_pl_po', {
                params: {
                    page,
                    perPage: pageSize,
                    ...filters,
                },
            }),

        ])

        const { data: payload = [], pagination } = response

        rows.value = Array.isArray(payload)
            ? payload.map((entry, index) => ({
                ...entry,
                id: `${entry.po_no ?? 'PO'} - ${entry.row_no ?? index}`,
                status_label: STATUS_LOOKUP[entry.status] ?? String(entry.status ?? '-'),
            }))
            : []

        if (pagination) {
            currentPage.value = pagination.currentPage ?? page
            perPage.value = pagination.perPage ?? pageSize
            totalRows.value = pagination.total ?? totalRows.value
        }
    } catch (error) {
        console.log(error)
    } finally {
        isLoading.value = false
    }
}

const fetchDivisions = async () => {
    try {
        const { data = [] } = await apiPublic.get('/z_po_pl_po/divisions')
        divisionOptions.value = Array.isArray(data) ? data : []
        if (authCookie.value?.role === 'EMPLOYEE' && authCookie.value?.division) {
            team.value = authCookie.value.division
        }
    } catch (error) {
        console.log(error)
        divisionOptions.value = []
    }
}

const triggerFilterFetch = () => {
    currentPage.value = 1
    fetchPlPoPl(1, perPage.value)
}

const resetFilters = () => {
    deliveryDate.value = getTodayDate()
    team.value = authCookie.value?.role === 'EMPLOYEE' ? authCookie.value?.division || null : null
    item.value = ''
    triggerFilterFetch()
}

const handleLogout = async () => {
    authCookie.value = null
    await router.push('/login')
}

watch([deliveryDate, team], () => {
    triggerFilterFetch()
})


watch(item, () => {
    if (searchDebounce) clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
        triggerFilterFetch()
    }, 400)
})

onBeforeUnmount(() => {
    if (searchDebounce) clearTimeout(searchDebounce)
})

const handlePageChange = (event) => {
    const nextPage = (event?.page ?? 0) + 1
    const nextPageSize = event?.rows ?? perPage.value

    currentPage.value = nextPage
    perPage.value = nextPageSize

    fetchPlPoPl(nextPage, nextPageSize)
}

const getStatusClass = (status) => {
    switch (status) {
        case 'Received':
            return 'inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700'
        case 'Approve':
            return 'inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700'
        case 'Open':
            return 'inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-semibold text-white'
        default:
            return 'inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'
    }
}

fetchPlPoPl()
fetchDivisions()
</script>

<style scoped>
:deep(.dp-input-sm) {
    height: 2.25rem;
    font-size: 0.85rem;
    padding: 0 0.75rem;
    border-radius: 0.65rem;
}

:deep(.vs-select-sm .vs__dropdown-toggle) {
    min-height: 2.25rem;
    border-radius: 0.65rem;
    padding: 0 0.65rem;
}

:deep(.vs-select-sm .vs__selected),
:deep(.vs-select-sm .vs__search),
:deep(.vs-select-sm .vs__placeholder) {
    font-size: 0.85rem;
}
</style>
