import { useAirportStore } from '../store/useAirportStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import type { Baggage as BaggageType } from '../types'
import clsx from 'clsx'

export default function Baggage() {
  const { data } = useAirportStore()
  if (!data) return null

  const columns: Column<BaggageType>[] = [
    { key: 'bag_tag_number', label: 'Tag #' },
    { key: 'flight_number', label: 'Flight' },
    { key: 'pnr_code', label: 'PNR' },
    { key: 'weight_kg', label: 'Weight (kg)', numeric: true, render: (b) => b.weight_kg?.toFixed(1) },
    { key: 'bag_status', label: 'Status' },
    { key: 'handling_location', label: 'Location' },
    {
      key: 'is_flagged',
      label: 'Flag',
      render: (b) => (
        <span
          className={clsx(
            'text-[11px] px-2 py-0.5 rounded-full border',
            b.is_flagged || b.mishandling_count > 0
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          )}
        >
          {b.is_flagged || b.mishandling_count > 0 ? `Flagged x${b.mishandling_count}` : 'Clear'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Baggage</h1>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] h-[calc(100vh-140px)]">
        <DataTable
          columns={columns}
          rows={data.baggage}
          rowKey={(b) => b.bag_tag_number}
          searchKeys={['bag_tag_number', 'flight_number', 'pnr_code']}
        />
      </div>
    </div>
  )
}
