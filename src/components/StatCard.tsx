import clsx from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  tone?: 'default' | 'warning' | 'critical' | 'good'
}

const toneClasses: Record<string, string> = {
  default: 'text-slate-100',
  warning: 'text-amber-400',
  critical: 'text-rose-400',
  good: 'text-emerald-400',
}

export function StatCard({ label, value, sub, tone = 'default' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={clsx('text-2xl font-semibold mt-1', toneClasses[tone])}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}
