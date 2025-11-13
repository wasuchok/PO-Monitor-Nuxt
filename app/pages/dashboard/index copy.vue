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
                <Vue3Datatable class="mt-6" :rows="filteredRows" :columns="columns" :search="search" :pageSize="5"
                    :pageSizeOptions="[5, 10, 20]" skin="bh-table-bordered" />

                <template #fallback>
                    <div
                        class="mt-6 flex items-center justify-center rounded-xl border border-dashed border-neutral-200 p-8 text-sm text-neutral-500">
                        กำลังโหลดตาราง...
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
        field: 'poNumber',
        title: 'PO_No',
        width: '110px',
        sort: true,
    },
    {
        field: 'POROW',
        title: 'Vendor',
    },
    {
        field: 'department',
        title: 'PO_DATE',
        width: '160px',
    },
    {
        field: 'amount',
        title: 'ArrDate',
        type: 'number',
        cellClass: 'text-right',
        width: '140px',
    },
    {
        field: 'dueDate',
        title: 'PR_Number',
        type: 'date',
        width: '140px',
    },
    {
        field: 'status',
        title: 'Vendor',
        width: '140px',
    },
    {
        field: 'status',
        title: 'Reference',
        width: '140px',
    },
    {
        field: 'status',
        title: 'ROWNO',
        width: '140px',
    },
    {
        field: 'status',
        title: 'ITEMNO',
        width: '140px',
    },
    {
        field: 'status',
        title: 'Model',
        width: '140px',
    },
    {
        field: 'status',
        title: 'Brand',
        width: '140px',
    },
    {
        field: 'status',
        title: 'OQORDERED',
        width: '140px',
    },
    {
        field: 'status',
        title: 'ORDERUNIT',
        width: '140px',
    },
    {
        field: 'status',
        title: 'Status',
        width: '140px',
    },
    {
        field: 'status',
        title: 'Division',
        width: '140px',
    },
    {
        field: 'status',
        title: 'User_Create',
        width: '140px',
    },
])

const rows = ref([
    {
        id: 1,
        poNumber: 'PO-24015',
        vendor: 'Siam IT Supplies',
        department: 'Procurement',
        amount: 82000,
        dueDate: '2025-11-30',
        status: 'Pending',
    },
    {
        id: 2,
        poNumber: 'PO-24009',
        vendor: 'Bangkok Logistics',
        department: 'Logistics',
        amount: 45200,
        dueDate: '2025-11-18',
        status: 'Approved',
    },
    {
        id: 3,
        poNumber: 'PO-23998',
        vendor: 'Eastern Foods',
        department: 'Operations',
        amount: 138500,
        dueDate: '2025-11-22',
        status: 'Pending',
    },
    {
        id: 4,
        poNumber: 'PO-23975',
        vendor: 'Metro Marketing',
        department: 'Marketing',
        amount: 28600,
        dueDate: '2025-11-15',
        status: 'Rejected',
    },
    {
        id: 5,
        poNumber: 'PO-23940',
        vendor: 'Northwind Electric',
        department: 'Facilities',
        amount: 512000,
        dueDate: '2025-12-05',
        status: 'Approved',
    },
    {
        id: 6,
        poNumber: 'PO-23888',
        vendor: 'Chiangmai Crafts',
        department: 'Retail',
        amount: 76500,
        dueDate: '2025-11-27',
        status: 'Pending',
    },
])

const search = ref('')
const deliveryDate = ref(null)
const team = ref(null)
const item = ref('')
const teamOptions = [...new Set(rows.value.map((row) => row.department))]

const filteredRows = computed(() => {
    const dateFilter = deliveryDate.value
    const teamFilter = team.value
    const itemFilter = item.value.trim().toLowerCase()

    return rows.value.filter((row) => {
        const matchDate = dateFilter ? row.dueDate === dateFilter : true
        const matchTeam = teamFilter ? row.department === teamFilter : true
        const matchItem = itemFilter
            ? `${row.poNumber} ${row.vendor} ${row.status}`.toLowerCase().includes(itemFilter)
            : true

        return matchDate && matchTeam && matchItem
    })
})
</script>

<style lang="scss" scoped></style>
