<template>
    <Teleport to="body">
        <div v-if="isOpen"
            class="po-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
            @click.self="emitClose">
            <div v-if="isOpen"
                :lang="langAttr"
                class="po-modal-panel flex w-full max-w-3xl max-h-[85vh] flex-col rounded-[18px] border border-neutral-100 bg-white/95 p-6 shadow-lg lg:p-7">
                <div class="flex flex-wrap items-start justify-between gap-4 pb-3">
                    <div class="space-y-1">
                        <p class="text-[11px] font-semibold uppercase tracking-[0.4em] text-neutral-400">
                            PO Details
                        </p>
                        <p class="text-2xl font-semibold text-neutral-900">
                            {{ activePoNumber || detailHeader?.po_no || '-' }}
                        </p>
                        <p v-if="detailHeader?.vendor_name" class="text-sm text-neutral-500">
                            {{ detailHeader.vendor_name }}
                        </p>
                    </div>
                    <button type="button"
                        class="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-primary-200 hover:text-primary-700"
                        @click="emitClose">
                        Close
                    </button>
                </div>

                <div class="receipt-tear my-3"></div>

                <div class="flex-1 overflow-y-auto space-y-5 py-2 pr-1">
                    <div v-if="isLoading" class="py-8 text-center text-sm text-neutral-500">
                        Loading details...
                    </div>
                    <div v-else-if="detailErrorMessage" class="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                        {{ detailErrorMessage }}
                    </div>
                    <div v-else-if="!poDetailEntries.length"
                        class="rounded-xl bg-neutral-50 p-4 text-center text-sm text-neutral-500">
                        No items found for this PO
                    </div>
                    <div v-else class="space-y-5">
                        <div class="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-4">
                            <div class="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
                                <div v-if="detailHeader?.po_date">
                                    <p class="text-[11px] uppercase tracking-wide text-neutral-400">PO Date</p>
                                    <p class="text-sm font-semibold text-neutral-900">
                                        {{ formatThaiDate(detailHeader.po_date) }}
                                    </p>
                                </div>
                                <div v-if="detailHeader?.arrival_date">
                                    <p class="text-[11px] uppercase tracking-wide text-neutral-400">Delivery Date</p>
                                    <p class="text-sm font-semibold text-neutral-900">
                                        {{ formatThaiDate(detailHeader.arrival_date) }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-[11px] uppercase tracking-wide text-neutral-400">Location</p>
                                    <p class="text-sm font-semibold text-neutral-900">
                                        {{ detailHeader?.location || '-' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-[11px] uppercase tracking-wide text-neutral-400">Reference</p>
                                    <p class="text-sm font-semibold text-neutral-900">
                                        {{ detailHeader?.reference || '-' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-[11px] uppercase tracking-wide text-neutral-400">Payment Terms</p>
                                    <p class="text-sm font-semibold text-neutral-900">
                                        {{ detailHeader?.term_desc || '-' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="rounded-2xl border border-neutral-200 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.25)]">
                            <div class="flex items-center justify-between border-b border-dashed border-neutral-200 px-4 py-3">
                                <p class="text-sm font-semibold text-neutral-800">Items</p>
                                <p class="text-xs text-neutral-400">{{ poDetailEntries.length }} entries</p>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full text-sm">
                                    <thead class="po-table-head">
                                        <tr>
                                            <th>Item</th>
                                            <th>Quantity</th>
                                            <th>Unit</th>
                                            <th>PR Number</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="detail in poDetailEntries"
                                            :key="`${detail.po_no}-${detail.po_row ?? detail.item_no}`">
                                            <td>
                                                <p class="font-medium text-neutral-900">
                                                    {{ detail.item_desc || 'Unknown' }}
                                                </p>
                                                <p class="text-xs text-neutral-400">
                                                    {{ detail.item_no || '-' }}
                                                </p>
                                            </td>
                                            <td>{{ detail.qty_order ?? '-' }}</td>
                                            <td>{{ detail.order_unit || '-' }}</td>
                                            <td>{{ detail.pr_number || '-' }}</td>

                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PoDetailEntry } from '~/types/purchase-orders'

const props = withDefaults(
    defineProps<{
        isOpen: boolean
        isLoading: boolean
        detailHeader: PoDetailEntry | null
        detailErrorMessage: string | null
        poDetailEntries: PoDetailEntry[]
        activePoNumber: string
        formatThaiDate: (date?: string | null) => string
        formatCurrency: (value?: number | null) => string
        language?: 'en' | 'th'
    }>(),
    {
        isOpen: false,
        isLoading: false,
        detailHeader: null,
        detailErrorMessage: null,
        poDetailEntries: () => [],
        activePoNumber: '',
        language: 'en',
    },
)

const langAttr = computed(() => (props.language === 'th' ? 'th' : 'en'))

const emit = defineEmits<{ (event: 'close'): void }>()

const emitClose = () => {
    emit('close')
}
</script>

<style scoped>
.po-modal-overlay,
.po-modal-panel {
    will-change: opacity, transform;
}

.po-table-head {
    background: #f7f7f7;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 11px;
    color: #71717a;
}

.po-table-head th {
    text-align: left;
    font-weight: 600;
    padding: 0.75rem 1rem;
}

tbody tr {
    border-top: 1px solid #f1f1f1;
}

tbody td {
    padding: 0.9rem 1rem;
    vertical-align: top;
}

.receipt-tear {
    height: 12px;
    background:
        radial-gradient(circle at 12px 6px, transparent 6px, #e5e5e5 6px, #e5e5e5 7px, transparent 7px) left/24px 12px repeat-x,
        linear-gradient(to right, transparent 0, transparent 100%);
}
</style>
