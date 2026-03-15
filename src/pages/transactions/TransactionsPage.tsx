import { useMemo, useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useToast } from '@/context/ToastContext'
import { Card, EmptyState, Button } from '@/components/ui'
import { fmt, exportToCSV } from '@/utils'
import { CATEGORIES } from '@/lib/constants'
import type { TxnFilter } from '@/types'

export default function TransactionsPage() {
  const { txns, deleteTransaction } = useTransactions()
  const { toast } = useToast()
  const [filter, setFilter] = useState<TxnFilter>('all')
  const [query, setQuery]   = useState('')

  const filtered = useMemo(() => {
    let list = [...txns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    if (filter !== 'all') list = list.filter(t => t.type === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    }
    return list
  }, [txns, filter, query])

  async function handleDelete(id: number) {
    await deleteTransaction(id)
    toast('Deleted', 'info')
  }

  function handleExport() {
    exportToCSV(filtered, `finio-${filter}-${new Date().toISOString().split('T')[0]}.csv`)
    toast('CSV exported ✓')
  }

  const filterBtn = (f: TxnFilter, label: string) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className="flex-1 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-200"
      style={{
        background: filter === f ? '#6c63ff' : 'transparent',
        color: filter === f ? '#fff' : 'var(--text-secondary)',
        boxShadow: filter === f ? '0 4px 16px rgba(108,99,255,0.35)' : 'none',
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="screen flex flex-col gap-5">
      {/* Search + export */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
                style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search transactions…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <Button variant="ghost" onClick={handleExport} className="flex-shrink-0">
          ↓ Export CSV
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-[var(--radius)]"
           style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
        {filterBtn('all',     'All')}
        {filterBtn('expense', 'Expenses')}
        {filterBtn('income',  'Income')}
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Transaction', 'Category', 'Date', 'Amount', ''].map(h => (
                <th key={h} className="text-left px-3 pb-3.5 pt-0 text-[11px] font-medium uppercase tracking-[0.8px]"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', padding: '0 12px 14px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState icon={query ? '🔍' : '💳'} text={query ? 'No transactions match your search.' : 'No transactions yet.'} />
                </td>
              </tr>
            ) : filtered.map((t, i) => {
              const c = CATEGORIES[t.category as keyof typeof CATEGORIES] ?? CATEGORIES.Other
              return (
                <tr
                  key={t.id}
                  className="group transition-colors duration-150 animate-slide-in"
                  style={{ animationDelay: `${Math.min(i, 20) * 0.03}s`, borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base flex-shrink-0"
                           style={{ background: c.bg }}>{c.icon}</div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {t.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: c.bg, color: c.color }}>
                      {c.icon} {t.category}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{t.date}</td>
                  <td className={`px-3 py-3.5 text-[15px] font-semibold ${t.type === 'expense' ? 'text-brand-red' : 'text-brand-green'}`}>
                    {t.type === 'expense' ? '-' : '+'}{fmt(t.amount)}
                  </td>
                  <td className="px-3 py-3.5">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-lg transition-all duration-200"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,92,122,0.12)'; e.currentTarget.style.color = '#ff5c7a' }}
                      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
