import { useState } from 'react'
import { useAirportStore } from '../store/useAirportStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import type { StaffShift } from '../types'
import clsx from 'clsx'

const DEPARTMENTS = ['All', 'Security', 'Customer Care', 'Retail', 'Ground Handling', 'Maintenance', 'Operations']

export default function Staff() {
  const { data } = useAirportStore()
  const [dept, setDept] = useState('All')
  if (!data) return null

  const rows = dept === 'All' ? data.staff : data.staff.filter((s) => s.derived_department === dept)

  // NOTE: staff_shifts.csv's own department/role/terminal/gate_assigned/
  // shift_duration_hours/is_on_leave/language columns are constant across
  // every one of its 600 rows (see SCHEMA_NOTES.md) — they carry no real
  // signal, so they're deliberately left out of this table. derived_department
  // (parsed from the staff_id prefix) is the real department field.
  const columns: Column<StaffShift>[] = [
    { key: 'staff_id', label: 'Staff ID' },
    { key: 'staff_name', label: 'Name' },
    { key: 'derived_department', label: 'Department' },
    { key: 'shift_date', label: 'Shift Date' },
    { key: 'shift_start', label: 'Start' },
    { key: 'shift_end', label: 'End' },
    { key: 'supervisor_id', label: 'Supervisor' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Staff Shifts</h1>
        <div className="flex gap-1.5 text-xs flex-wrap">
          {DEPARTMENTS.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={clsx(
                'px-3 py-1.5 rounded-md border',
                dept === d
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'border-white/10 text-slate-400 hover:bg-white/5'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] h-[calc(100vh-160px)]">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(s) => s.staff_id}
          searchKeys={['staff_id', 'staff_name', 'derived_department']}
        />
      </div>
    </div>
  )
}
