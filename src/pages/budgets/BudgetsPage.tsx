import { useMemo } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { fmt, fmtFull, getMonthTxns } from '@/utils'
import { CATEGORIES } from '@/lib/constants'

export default function BudgetsPage() {
  const { txns, catLimits } = useTransactions()

  const mt = useMemo(() => getMonthTxns(txns).filter(t => t.type === 'expense'), [txns])
  const catSpend = useMemo(() => {
    const m: Record<string, number> = {}
    mt.forEach(t => { m[t.category] = (m[t.category] ?? 0) + t.amount })
    return m
  }, [mt])

  const totalBudget = Object.values(catLimits).reduce((s, v) => s + v, 0)
  const totalSpent  = Object.keys(catLimits).reduce((s, k) => s + (catSpend[k] ?? 0), 0)
  const totalPct    = Math.min(Math.round((totalSpent / totalBudget) * 100), 100)

  const barColor = totalPct > 90
    ? 'linear-gradient(90deg,#ff5c7a,#ff8a9b)'
    : totalPct > 70
    ? 'linear-gradient(90deg,#ffb84d,#ffd280)'
    : 'linear-gradient(90deg,#6c63ff,#00d68f)'

  return (
    <div className="screen flex flex-col gap-5">
      {/* Overall hero */}
      <div className="hcard" style={{ background: 'linear-gradient(135deg,#0f1729,#1a1040,#0d1a38)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%,rgba(108,99,255,0.25),transparent 60%)' }} />
        <p className="text-xs tracking-wide mb-2.5 relative" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Overall Budget Health
        </p>
        <div className="flex items-baseline gap-4 mb-3.5 relative">
          <p className="hcard-amount" style={{ fontSize: 36 }}>{fmtFull(totalSpent)}</p>
          <p className="text-base relative" style={{ color: 'rgba(255,255,255,0.5)' }}>
            of {fmtFull(totalBudget)}
          </p>
        </div>
        <div className="max-w-[400px] h-2.5 rounded-full overflow-hidden relative"
             style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
               style={{ width: `${totalPct}%`, background: barColor, transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
        <p className="text-xs mt-2 relative" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {fmtFull(Math.max(totalBudget - totalSpent, 0))} remaining · {totalPct}% used
        </p>
      </div>

      {/* Per-category grid */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(catLimits).map(([cat, limit]) => {
          const spent = catSpend[cat] ?? 0
          const pct   = Math.min(Math.round((spent / limit) * 100), 100)
          const over  = spent > limit
          const c     = CATEGORIES[cat as keyof typeof CATEGORIES] ?? CATEGORIES.Other
          const bc    = over ? '#ff5c7a' : pct > 75 ? '#ffb84d' : c.color
          const pc    = over ? '#ff5c7a' : pct > 75 ? '#ffb84d' : '#00d68f'

          return (
            <div
              key={cat}
              className="rounded-card p-5 transition-all duration-250 hover:-translate-y-0.5"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="flex justify-between items-start mb-3.5">
                <div className="flex items-center gap-2.5 text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg"
                       style={{ background: c.bg }}>
                    {c.icon}
                  </div>
                  {cat}
                </div>
                <span className="font-display text-xl font-bold" style={{ color: pc }}>
                  {pct}%
                </span>
              </div>

              <div className="h-2 rounded-full overflow-hidden mb-2.5"
                   style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    background: bc,
                    boxShadow: `0 0 8px ${bc}55`,
                    transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>

              <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{fmt(spent)} spent</span>
                <span>
                  {fmt(limit)} budget
                  {over && <span style={{ color: '#ff5c7a' }}> ▲</span>}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
