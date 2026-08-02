import { useAirportStore } from '../store/useAirportStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import type { MaintenanceLog } from '../types'
import clsx from 'clsx'

export default function Maintenance() {
  const { data } = useAirportStore()
  if (!data) return null

  const columns: Column<MaintenanceLog>[] = [
    { key: 'work_order_id', label: 'Work Order' },
    { key: 'aircraft_registration', label: 'Aircraft' },
    { key: 'maintenance_type', label: 'Type' },
    { key: 'defect_type', label: 'Defect' },
    { key: 'component', label: 'Component' },
    {
      key: 'severity_level',
      label: 'Severity',
      numeric: true,
      render: (m) => (
        <span
          className={clsx(
            m.severity_level >= 4 ? 'text-rose-400' : m.severity_level >= 2 ? 'text-amber-400' : 'text-emerald-400'
          )}
        >
          {m.severity_level}
        </span>
      ),
    },
    { key: 'duration_hours', label: 'Duration (h)', numeric: true },
    {
      key: 'is_aog',
      label: 'AOG',
      render: (m) =>
        m.is_aog ? (
          <span className="text-[11px] px-2 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300">
            AOG
          </span>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Maintenance</h1>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] h-[calc(100vh-140px)]">
        <DataTable
          columns={columns}
          rows={data.maintenance}
          rowKey={(m) => m.work_order_id}
          searchKeys={['work_order_id', 'aircraft_registration', 'defect_type']}
        />
      </div>
    </div>
  )
}
