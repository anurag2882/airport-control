import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, Search } from 'lucide-react'
import clsx from 'clsx'

export interface Column<T> {
  key: keyof T
  label: string
  render?: (row: T) => React.ReactNode
  numeric?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  searchKeys?: (keyof T)[]
  pageSize?: number
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  searchKeys,
  pageSize = 20,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (!query || !searchKeys) return rows
    const q = query.toLowerCase()
    return rows.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q))
    )
  }, [rows, query, searchKeys])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av ?? '').localeCompare(String(bv ?? ''))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice(page * pageSize, (page + 1) * pageSize)

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  return (
    <div className="flex flex-col h-full">
      {searchKeys && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
          <Search size={14} className="text-slate-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Search..."
            className="bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none flex-1"
          />
          <span className="text-xs text-slate-500">{sorted.length} results</span>
        </div>
      )}
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#0d121e] z-10">
            <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => handleSort(col.key)}
                  className={clsx(
                    'px-3 py-2 cursor-pointer select-none whitespace-nowrap hover:text-slate-200',
                    col.numeric && 'text-right'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key &&
                      (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'border-b border-white/5 hover:bg-white/5 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={clsx('px-3 py-2 text-slate-300 whitespace-nowrap', col.numeric && 'text-right')}
                  >
                    {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-white/10 text-xs text-slate-500">
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-2 py-1 rounded bg-white/5 disabled:opacity-30 hover:bg-white/10"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="px-2 py-1 rounded bg-white/5 disabled:opacity-30 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
