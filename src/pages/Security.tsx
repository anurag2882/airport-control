import { useAirportStore } from '../store/useAirportStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import type { SecurityScreening } from '../types'
import clsx from 'clsx'

export default function Security() {
  const { data } = useAirportStore()
  if (!data) return null

  const columns: Column<SecurityScreening>[] = [
    { key: 'screening_id', label: 'ID' },
    { key: 'lane_number', label: 'Lane', numeric: true },
    { key: 'lane_type', label: 'Lane Type' },
    { key: 'screening_result', label: 'Result' },
    {
      key: 'queue_length',
      label: 'Queue Load',
      render: (s) => {
        const pct = Math.round((s.queue_length / (s.queue_capacity || 1)) * 100)
        return (
          <span className={clsx(pct >= 85 ? 'text-rose-400' : pct >= 60 ? 'text-amber-400' : 'text-emerald-400')}>
            {s.queue_length}/{s.queue_capacity} ({pct}%)
          </span>
        )
      },
    },
    { key: 'processing_time_seconds', label: 'Proc. Time (s)', numeric: true },
    {
      key: 'secondary_screening',
      label: 'Secondary',
      render: (s) => (s.secondary_screening ? 'Yes' : 'No'),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Security Screening</h1>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] h-[calc(100vh-140px)]">
        <DataTable
          columns={columns}
          rows={data.security}
          rowKey={(s) => s.screening_id}
          searchKeys={['screening_id', 'lane_type']}
        />
      </div>
    </div>
  )
}
