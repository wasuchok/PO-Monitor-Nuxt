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
                <div class="relative">
                    <Vue3Datatable class="mt-3" :rows="filteredRows" :columns="columns" :search="search"
                        :page="currentPage" :pageSize="perPage" :pageSizeOptions="[10, 20, 50]" :totalRows="totalRows"
                        :isServerMode="true" :loading="isLoading" skin="bh-table-bordered"
                        @change="handleTableChange" />

                    <div v-if="isLoading"
                        class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
                        <div class="flex items-center space-x-2 text-sm font-medium text-neutral-600">
                            <span class="h-3 w-3 animate-ping rounded-full bg-primary-500"></span>
                            <span>Loading Data...</span>
                        </div>
                    </div>
                </div>

                <template #fallback>
                    <div
                        class="mt-6 flex items-center justify-center rounded-xl border border-dashed border-neutral-200 p-8 text-sm text-neutral-500">
                        Loading Table...
                    </div>
                </template>
            </ClientOnly>
        </div>
    </section>
</template>

<script setup>
import Vue3Datatable from '@bhplugin/vue3-datatable'
import '@bhplugin/vue3-datatable/dist/style.css'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, ref } from 'vue'
import VSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const columns = ref([
    {
        field: 'po_no',
        title: 'PO_No',
    },
    {
        field: 'vendor_name',
        title: 'Vendor',

    },
    {
        field: 'po_date',
        title: 'PO_DATE',

    },
    {
        field: 'arrival_date',
        title: 'ArrDate',

    },
    {
        field: 'pr_number',
        title: 'PR_Number',

    },
    {
        field: 'reference',
        title: 'Reference',

    },
    {
        field: 'row_no',
        title: 'ROWNO',

    },
    {
        field: 'item_no',
        title: 'ITEMNO',

    },
    {
        field: 'item_desc',
        title: 'Item Description',

    },
    {
        field: 'model',
        title: 'Model',

    },
    {
        field: 'brand',
        title: 'Brand',

    },
    {
        field: 'oq_ordered',
        title: 'OQORDERED',
        type: 'number',

    },
    {
        field: 'order_unit',
        title: 'ORDERUNIT',

    },
    {
        field: 'status_label',
        title: 'Status',

    },
    {
        field: 'division',
        title: 'Division',

    },
    {
        field: 'user_create',
        title: 'User_Create',

    },
])

const STATUS_LOOKUP = {
    1: 'Draft',
    2: 'Partial',
    3: 'Completed',
}

const { apiPublic } = useApi()
const search = ref('')
const deliveryDate = ref(null)
const team = ref(null)
const item = ref('')
const rows = ref([])
const currentPage = ref(1)
const perPage = ref(10)
const totalRows = ref(0)
const isLoading = ref(false)
const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))
const teamOptions = computed(() => [
    ...new Set(rows.value.map((row) => row.division).filter(Boolean)),
])

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
            wait(1000),
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
            console.log(pagination)
        }
    } catch (error) {
        console.log(error)
    } finally {
        isLoading.value = false
    }
}

const handleTableChange = (change) => {
    const nextPage = change?.current_page ?? 1
    const nextPageSize = change?.pagesize ?? perPage.value

    fetchPlPoPl(nextPage, nextPageSize)
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

<style lang="scss" scoped></style>
