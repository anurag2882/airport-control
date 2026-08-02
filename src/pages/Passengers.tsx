import { useAirportStore } from '../store/useAirportStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import type { Passenger } from '../types'

export default function Passengers() {
  const { data } = useAirportStore()
  if (!data) return null

  const columns: Column<Passenger>[] = [
    { key: 'pnr_code', label: 'PNR' },
    { key: 'first_name', label: 'First' },
    { key: 'last_name', label: 'Last' },
    { key: 'flight_number', label: 'Flight' },
    { key: 'seat_number', label: 'Seat' },
    { key: 'fare_class', label: 'Class' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'age_group', label: 'Age Group' },
    {
      key: 'is_frequent_flyer',
      label: 'Frequent Flyer',
      render: (p) => (p.is_frequent_flyer ? 'Yes' : 'No'),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Passengers</h1>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] h-[calc(100vh-140px)]">
        <DataTable
          columns={columns}
          rows={data.passengers}
          rowKey={(p) => p.pnr_code}
          searchKeys={['pnr_code', 'first_name', 'last_name', 'flight_number']}
        />
      </div>
    </div>
  )
}
