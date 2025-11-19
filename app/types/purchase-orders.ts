export type CalendarEventColor = 'blue' | 'yellow' | 'green' | 'red' | 'purple'

export interface CalendarEvent {
    id: number | string
    title: string
    time: { start: string; end: string }
    description?: string
    color?: CalendarEventColor
}

export type CalendarEntry = {
    po_no: string
    po_date: string
    division?: string | null
    status?: number | null
}

export type CalendarApiResponse = {
    data?: CalendarEntry[]
}

export type PoDetailEntry = {
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
