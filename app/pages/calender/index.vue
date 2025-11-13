<template>
    <section lang="th" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-4">
            <ClientOnly>
                <div class="relative rounded-md bg-white p-1 shadow-sm  lg:col-span-3 lg:p-2 is-light-mode">
                    <Qalendar class="min-h-[80vh]" :events="poEvents" :config="calendarConfig"
                        :selected-date="selectedDate" :is-loading="false" />
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
import { ref } from 'vue'

interface Event {
    id: number | string
    title: string
    time: { start: string; end?: string }
}

const selectedDate = ref(new Date())

const poEvents = ref<Event[]>([
    {
        id: 1,
        title: 'PO-001: สั่งซื้อวัสดุสำนักงาน',
        time: { start: '2025-11-14 10:00', end: '2025-11-14 12:00' }
    },
    {
        id: 2,
        title: 'PO-002: สั่งซื้อเครื่องจักร',
        time: { start: '2025-11-15 14:00', end: '2025-11-15 16:00' }
    },
    {
        id: 3,
        title: 'PO-003: สั่งซื้อสินค้าคงคลัง',
        time: { start: '2025-11-17 09:00', end: '2025-11-17 11:00' }
    },
    {
        id: 4,
        title: 'PO-004: สั่งซื้ออุปกรณ์ IT',
        time: { start: '2025-11-20 15:00', end: '2025-11-20 17:00' }
    },
    {
        id: 5,
        title: 'PO-005: สั่งซื้อบริการซ่อมบำรุง',
        time: { start: '2025-11-22 13:00', end: '2025-11-22 15:00' }
    },
    {
        id: 6,
        title: 'PO-006: สั่งซื้อวัตถุดิบ',
        time: { start: '2025-11-25 11:00', end: '2025-11-25 13:00' }
    },
    {
        id: 7,
        title: 'PO-007: สั่งซื้อเฟอร์นิเจอร์',
        time: { start: '2025-12-01 10:00', end: '2025-12-01 12:00' }
    },
    {
        id: 8,
        title: 'PO-008: สั่งซื้อซอฟต์แวร์',
        time: { start: '2025-12-05 14:00', end: '2025-12-05 16:00' }
    }
])

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