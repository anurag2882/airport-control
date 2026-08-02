const PREFIX_MAP: Record<string, string> = {
  SEC: 'Security',
  CC: 'Customer Care',
  RET: 'Retail',
  GH: 'Ground Handling',
  MTC: 'Maintenance',
  OPS: 'Operations',
}

export function deriveStaffDepartment(staffId: string): string {
  const prefix = staffId?.split('-')[0]
  return PREFIX_MAP[prefix] ?? 'Unknown'
}
