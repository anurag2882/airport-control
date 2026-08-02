import { useAirportStore } from '../store/useAirportStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import type { GateEvent } from '../types'

export default function Gates() {
  const { data } = useAirportStore()
  if (!data) return null

  const columns: Column<GateEvent>[] = [
    { key: 'gate', label: 'Gate' },
    { key: 'flight_number', label: 'Flight' },
    { key: 'event_type', label: 'Event' },
    { key: 'event_category', label: 'Category' },
    {
      key: 'event_time',
      label: 'Time',
      render: (g) => new Date(g.event_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
    },
    { key: 'duration_minutes', label: 'Duration (m)', numeric: true },
    { key: 'staff_id', label: 'Staff' },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Gate Events</h1>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] h-[calc(100vh-140px)]">
        <DataTable
          columns={columns}
          rows={data.gateEvents}
          rowKey={(g) => g.event_id}
          searchKeys={['gate', 'flight_number', 'event_type']}
        />
      </div>
    </div>
  )
}
