import { useAirportStore } from '../store/useAirportStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import type { RetailTransaction } from '../types'

export default function Retail() {
  const { data } = useAirportStore()
  if (!data) return null

  const columns: Column<RetailTransaction>[] = [
    { key: 'transaction_id', label: 'Txn ID' },
    { key: 'product_category', label: 'Category' },
    { key: 'flight_number', label: 'Flight' },
    { key: 'quantity', label: 'Qty', numeric: true },
    { key: 'amount_inr', label: 'Amount (₹)', numeric: true },
    { key: 'payment_method', label: 'Payment' },
    { key: 'location_type', label: 'Location' },
    {
      key: 'transaction_time',
      label: 'Time',
      render: (r) => new Date(r.transaction_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Retail Transactions</h1>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] h-[calc(100vh-140px)]">
        <DataTable
          columns={columns}
          rows={data.retail}
          rowKey={(r) => r.transaction_id}
          searchKeys={['transaction_id', 'product_category', 'flight_number']}
        />
      </div>
    </div>
  )
}
