<template>
    <section class="space-y-6">
        <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">


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
                    <DataTable class="prime-po-table text-[11px]" :value="rows" :loading="isLoading" dataKey="id" lazy
                        paginator :first="firstRow" :rows="perPage" :rowsPerPageOptions="pageSizeOptions"
                        :totalRecords="totalRows" :rowHover="true" :tableStyle="{ fontSize: '0.8rem' }" showGridlines
                        scrollable scrollHeight="" @page="handlePageChange">
                        <Column field="po_no" header="PO No" sortable style="min-width: 8rem" />
                        <Column field="vendor_name" header="Vendor" sortable style="min-width: 10rem" />
                        <Column field="po_date" header="PO Date" sortable style="min-width: 6.5rem" />
                        <Column field="arrival_date" header="Arr Date" sortable style="min-width: 6.5rem" />
                        <Column field="pr_number" header="PR Number" sortable style="min-width: 7rem" />
                        <Column field="reference" header="Reference" style="min-width: 6rem" />
                        <Column field="row_no" header="Row No" style="min-width: 5rem" />
                        <Column field="item_no" header="Item No" style="min-width: 9rem" />
                        <Column field="item_desc" header="Item Description" style="min-width: 10rem" />
                        <Column field="model" header="Model" style="min-width: 6.5rem" />
                        <Column field="brand" header="Brand" style="min-width: 6rem" />
                        <Column field="oq_ordered" header="Qty" sortable style="min-width: 5rem" />
                        <Column field="order_unit" header="Unit" style="min-width: 5rem" />
                        <Column field="division" header="Division" style="min-width: 6rem" />
                        <Column field="user_create" header="User Create" style="min-width: 7rem" />
                        <Column header="Status" style="min-width: 6rem">
                            <template #body="{ data }">
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
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import VSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const STATUS_LOOKUP = {
    1: 'Draft',
    2: 'Partial',
    3: 'Completed',
}

const { apiPublic } = useApi()
const deliveryDate = ref(null)
const team = ref(null)
const item = ref('')
const rows = ref([])
const divisionOptions = ref([])
const currentPage = ref(1)
const perPage = ref(10)
const totalRows = ref(0)
const isLoading = ref(false)
const pageSizeOptions = [10, 20, 50]
const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))
let searchDebounce

const teamOptions = computed(() => {
    const items = divisionOptions.value
    const formatted = items.map(({ division, totalOrders }) => ({
        label: `${division || '-'}`,
        value: division,
    }))
    return formatted
})
const firstRow = computed(() => (currentPage.value - 1) * perPage.value)
const apiFilters = computed(() => ({
    division: team.value || undefined,
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
            wait(),
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
    } catch (error) {
        console.log(error)
        divisionOptions.value = []
    }
}

const triggerFilterFetch = () => {
    currentPage.value = 1
    fetchPlPoPl(1, perPage.value)
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
        case 'Completed':
            return 'inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700'
        case 'Partial':
            return 'inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700'
        case 'Draft':
            return 'inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600'
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
