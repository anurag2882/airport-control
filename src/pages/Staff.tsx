import { useAirportStore } from '../store/useAirportStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import type { StaffShift } from '../types'

export default function Staff() {
  const { data } = useAirportStore()
  if (!data) return null

  const columns: Column<StaffShift>[] = [
    { key: 'staff_id', label: 'Staff ID' },
    { key: 'staff_name', label: 'Name' },
    { key: 'department', label: 'Dept' },
    { key: 'role', label: 'Role' },
    { key: 'shift_date', label: 'Shift Date' },
    { key: 'gate_assigned', label: 'Gate' },
    { key: 'shift_duration_hours', label: 'Hours', numeric: true },
    { key: 'is_on_leave', label: 'On Leave', render: (s) => (s.is_on_leave ? 'Yes' : 'No') },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Staff Shifts</h1>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] h-[calc(100vh-140px)]">
        <DataTable
          columns={columns}
          rows={data.staff}
          rowKey={(s) => s.staff_id}
          searchKeys={['staff_id', 'staff_name', 'department', 'role']}
        />
      </div>
    </div>
  )
}
