<template>
    <section class="space-y-6">
        <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">


            <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-2">
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Delivery Date</p>
                    <ClientOnly>
                        <VueDatePicker v-model="deliveryDate" model-type="yyyy-MM-dd" :enable-time-picker="false"
                            auto-apply :clearable="true" placeholder="เลือกวันที่ส่งของ" :teleport="true" />
                        <template #fallback>
                            <div class="h-10 animate-pulse rounded-lg bg-neutral-100"></div>
                        </template>
                    </ClientOnly>
                </div>

                <div class="space-y-2">
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Team</p>
                    <ClientOnly>
                        <VSelect v-model="team" :options="teamOptions" placeholder="เลือกทีม" :clearable="true" />
                        <template #fallback>
                            <div class="h-10 animate-pulse rounded-lg bg-neutral-100"></div>
                        </template>
                    </ClientOnly>
                </div>

                <div class="space-y-2">
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Item</p>
                    <input v-model="item" type="text" placeholder="กรอกชื่อสินค้า/PO"
                        class="h-10 w-full rounded-lg border border-neutral-200 px-4 text-sm text-neutral-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
                </div>
            </div>

            <ClientOnly>
                <div class="relative rounded-md  p-3">
                    <DataTable class="" :value="filteredRows" :loading="isLoading" dataKey="id" lazy paginator
                        :first="firstRow" :rows="perPage" :rowsPerPageOptions="pageSizeOptions"
                        :totalRecords="totalRows" :rowHover="true" showGridlines scrollable scrollHeight=""
                        @page="handlePageChange">
                        <Column field="po_no" header="PO No" sortable style="min-width: 9rem" />
                        <Column field="vendor_name" header="Vendor" sortable style="min-width: 14rem" />
                        <Column field="po_date" header="PO Date" sortable style="min-width: 8rem" />
                        <Column field="arrival_date" header="Arr Date" sortable style="min-width: 8rem" />
                        <Column field="pr_number" header="PR Number" sortable style="min-width: 9rem" />
                        <Column field="reference" header="Reference" style="min-width: 8rem" />
                        <Column field="row_no" header="Row No" style="min-width: 6rem" />
                        <Column field="item_no" header="Item No" style="min-width: 11rem" />
                        <Column field="item_desc" header="Item Description" style="min-width: 14rem" />
                        <Column field="model" header="Model" style="min-width: 8rem" />
                        <Column field="brand" header="Brand" style="min-width: 7rem" />
                        <Column field="oq_ordered" header="Qty" sortable style="min-width: 6rem" />
                        <Column field="order_unit" header="Unit" style="min-width: 6rem" />
                        <Column field="division" header="Division" style="min-width: 7rem" />
                        <Column field="user_create" header="User Create" style="min-width: 9rem" />
                        <Column header="Status" style="min-width: 8rem">
                            <template #body="{ data }">
                                <span :class="getStatusClass(data.status_label)">
                                    {{ data.status_label }}
                                </span>
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <template #fallback>
                    <div
                        class="mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 p-8 text-neutral-500">
                        <span
                            class="h-8 w-8 animate-pulse rounded-full border border-neutral-300 bg-neutral-200/80"></span>
                        <p class="text-sm font-medium">Loading table...</p>
                        <p class="text-xs text-neutral-400">ข้อมูลจะปรากฏโดยอัตโนมัติ</p>
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
import { computed, ref } from 'vue'
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
const currentPage = ref(1)
const perPage = ref(10)
const totalRows = ref(0)
const isLoading = ref(false)
const pageSizeOptions = [10, 20, 50]

const teamOptions = computed(() => [
    ...new Set(rows.value.map((row) => row.division).filter(Boolean)),
])
const firstRow = computed(() => (currentPage.value - 1) * perPage.value)

const fetchPlPoPl = async (page = currentPage.value, pageSize = perPage.value) => {
    isLoading.value = true
    try {
        const [response] = await Promise.all([
            apiPublic.get('/z_po_pl_po', {
                params: {
                    page,
                    perPage: pageSize,
                },
            }),

        ])

        const { data: payload = [], pagination } = response

        rows.value = Array.isArray(payload)
            ? payload.map((entry, index) => ({
                ...entry,
                id: `${entry.po_no ?? 'PO'}-${entry.row_no ?? index}`,
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

const filteredRows = computed(() => {
    const dateFilter = deliveryDate.value
    const teamFilter = team.value
    const itemFilter = item.value.trim().toLowerCase()

    return rows.value.filter((row) => {
        const matchDate = dateFilter ? row.arrival_date === dateFilter : true
        const matchTeam = teamFilter ? row.division === teamFilter : true
        const matchItem = itemFilter
            ? `${row.po_no} ${row.vendor_name} ${row.item_no} ${row.item_desc}`.toLowerCase().includes(itemFilter)
            : true

        return matchDate && matchTeam && matchItem
    })
})
</script>

<style lang="scss" scoped>
:deep(.prime-po-table.p-datatable) {
    border-radius: 1.25rem;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    font-size: 0.9rem;
}

:deep(.prime-po-table .p-datatable-thead > tr > th) {
    background: linear-gradient(180deg, #f8fafc 0%, #e2e8ff 100%);
    color: #0f172a;
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-color: #e2e8f0;
}

:deep(.prime-po-table .p-datatable-tbody > tr > td) {
    border-color: #f1f5f9;
    color: #0f172a;
}

:deep(.prime-po-table .p-datatable-tbody > tr:nth-child(even)) {
    background-color: #f9fafb;
}

:deep(.prime-po-table .p-datatable-tbody > tr:hover) {
    background-color: #eef2ff;
}

:deep(.prime-po-table .p-paginator) {
    padding: 1rem;
}

:deep(.prime-po-table .p-paginator .p-paginator-page.p-highlight) {
    background: #4338ca;
    border-color: #4338ca;
    color: #fff;
}

:deep(.prime-po-table .p-paginator .p-paginator-page) {
    border-radius: 999px;
}

:deep(.prime-po-table .p-dropdown) {
    border-radius: 999px;
}
</style>
