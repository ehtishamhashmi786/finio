import { useTransactions } from '@/hooks/useTransactions'
import { Card, CardTitle, Toggle } from '@/components/ui'
import { fmt, getMonthTxns, getTodayStr } from '@/utils'
import { CATEGORIES } from '@/lib/constants'
import type { Controls } from '@/types'

export default function ControlsPage() {
  const { txns, controls, catLimits, updateControls, updateCatLimit } = useTransactions()
  const now = new Date()
  const today = getTodayStr()

  const mt        = getMonthTxns(txns)
  const todayExp  = txns.filter(t => t.date === today && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const income    = mt.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses  = mt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const catSpend: Record<string, number> = {}
  mt.filter(t => t.type === 'expense').forEach(t => { catSpend[t.category] = (catSpend[t.category] ?? 0) + t.amount })

  const wkStart = new Date(now); wkStart.setDate(now.getDate() - now.getDay())
  const weekExp = txns.filter(t => { const d = new Date(t.date); return d >= wkStart && t.type === 'expense' }).reduce((s, t) => s + t.amount, 0)

  const saved   = Math.max(income - expenses, 0)
  const savGoal = controls.savings.limit
  const savPct  = Math.min(Math.round((saved / savGoal) * 100), 100)

  function toggleKey(key: keyof Controls) {
    const current = controls[key] as { on: boolean } & Record<string, unknown>
    updateControls(key, { ...current, on: !current.on })
  }

  function updateLimit(key: 'daily' | 'weekly' | 'savings', val: number) {
    updateControls(key, { ...controls[key], limit: val })
  }

  // Active alerts
  const alerts: { icon: string; title: string; sub: string; color: string; tc: string }[] = []
  if (controls.daily.on && todayExp > controls.daily.limit) {
    alerts.push({ icon: '💸', title: 'Daily limit exceeded', sub: `Spent ${fmt(todayExp)} today (limit ${fmt(controls.daily.limit)})`, color: 'rgba(255,92,122,0.12)', tc: '#ff5c7a' })
  }
  Object.entries(catLimits).forEach(([cat, lim]) => {
    const sp = catSpend[cat] ?? 0
    if (sp > lim * 0.85) {
      const c = CATEGORIES[cat as keyof typeof CATEGORIES] ?? CATEGORIES.Other
      alerts.push({ icon: c.icon, title: `${cat} at ${Math.round((sp / lim) * 100)}% of budget`, sub: `${fmt(sp)} of ${fmt(lim)} limit`, color: sp > lim ? 'rgba(255,92,122,0.12)' : 'rgba(255,184,77,0.12)', tc: sp > lim ? '#ff5c7a' : '#ffb84d' })
    }
  })

  const CtrlCard = ({ title, id, limitKey, limitVal, unit, statusEl }: {
    title: string; id: keyof Controls; limitKey?: 'daily' | 'weekly' | 'savings'; limitVal?: number; unit?: string; statusEl: React.ReactNode
  }) => (
    <div className="rounded-card p-5" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3.5">
        <p className="text-[14px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <Toggle on={(controls[id] as { on: boolean }).on} onToggle={() => toggleKey(id)} />
      </div>
      {limitKey && (
        <div className="flex items-center gap-2 rounded-[var(--radius)] px-3.5 py-2.5 mb-2.5"
             style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>₨</span>
          <input
            type="number"
            defaultValue={limitVal}
            onBlur={e => updateLimit(limitKey, parseFloat(e.target.value) || limitVal!)}
            className="flex-1 bg-transparent border-0 outline-none text-[15px] font-semibold font-display"
            style={{ color: 'var(--text-primary)' }}
          />
          {unit && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{unit}</span>}
        </div>
      )}
      {statusEl}
    </div>
  )

  return (
    <div className="screen flex flex-col gap-5">
      <p className="text-[13px] -mt-2" style={{ color: 'var(--text-muted)' }}>
        Set limits, enable no-spend mode, and get live alerts when budgets are at risk.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <CtrlCard
          title="💸 Daily Spend Limit"
          id="daily"
          limitKey="daily"
          limitVal={controls.daily.limit}
          unit="/day"
          statusEl={
            <p className="text-xs" style={{ color: controls.daily.on ? (todayExp > controls.daily.limit ? '#ff5c7a' : '#00d68f') : 'var(--text-muted)' }}>
              {controls.daily.on
                ? (todayExp > controls.daily.limit
                  ? `🔴 Over! Spent ${fmt(todayExp)} today (limit ${fmt(controls.daily.limit)})`
                  : `✓ Today: ${fmt(todayExp)} of ${fmt(controls.daily.limit)}`)
                : 'Enable to track daily limit.'}
            </p>
          }
        />
        <CtrlCard
          title="📅 Weekly Spend Limit"
          id="weekly"
          limitKey="weekly"
          limitVal={controls.weekly.limit}
          unit="/week"
          statusEl={
            <p className="text-xs" style={{ color: controls.weekly.on ? (weekExp > controls.weekly.limit ? '#ff5c7a' : '#00d68f') : 'var(--text-muted)' }}>
              {controls.weekly.on
                ? (weekExp > controls.weekly.limit
                  ? `🔴 Over! Spent ${fmt(weekExp)} this week (limit ${fmt(controls.weekly.limit)})`
                  : `✓ This week: ${fmt(weekExp)} of ${fmt(controls.weekly.limit)}`)
                : 'Enable to track weekly limit.'}
            </p>
          }
        />
        <CtrlCard
          title="🎯 Monthly Savings Goal"
          id="savings"
          limitKey="savings"
          limitVal={controls.savings.limit}
          unit="target"
          statusEl={
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <span>Progress toward goal</span>
                <span>{fmt(saved)} / {fmt(savGoal)} ({savPct}%)</span>
              </div>
              <div className="bar-track" style={{ height: 6 }}>
                <div className="bar-fill" style={{ width: `${savPct}%`, background: '#00d68f' }} />
              </div>
            </div>
          }
        />
        <CtrlCard
          title="🔒 No-Spend Mode"
          id="nospend"
          statusEl={
            <div>
              <p className="text-[13px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Warning before logging any expense — great for no-spend days.
              </p>
              <p className="text-xs" style={{ color: controls.nospend.on ? '#ff5c7a' : 'var(--text-muted)' }}>
                {controls.nospend.on ? '🔒 Active — warning before every expense.' : 'Currently inactive.'}
              </p>
            </div>
          }
        />
      </div>

      {/* Per-category limits */}
      <Card>
        <CardTitle action="Edit limits inline — saves automatically">
          Per-Category Spend Limits
        </CardTitle>
        {Object.entries(catLimits).map(([cat, lim]) => {
          const c   = CATEGORIES[cat as keyof typeof CATEGORIES] ?? CATEGORIES.Other
          const sp  = catSpend[cat] ?? 0
          const pct = Math.min(Math.round((sp / lim) * 100), 100)
          const bc  = pct > 90 ? '#ff5c7a' : pct > 70 ? '#ffb84d' : c.color

          return (
            <div key={cat} className="flex items-center gap-3 py-3 border-b last:border-0"
                 style={{ borderColor: 'var(--border)' }}>
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[15px] flex-shrink-0"
                   style={{ background: c.bg }}>
                {c.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {cat}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(sp)} spent</span>
                </div>
                <div className="bar-track" style={{ height: 5 }}>
                  <div className="bar-fill" style={{ width: `${pct}%`, background: bc }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-3">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>₨</span>
                <input
                  type="number"
                  defaultValue={lim}
                  onBlur={e => updateCatLimit(cat, parseFloat(e.target.value) || lim)}
                  className="w-20 px-2 py-1.5 rounded-lg text-[13px] outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          )
        })}
      </Card>

      {/* Active alerts */}
      <Card>
        <CardTitle>
          <span>Active Alerts</span>
          {alerts.length > 0 && (
            <span className="badge badge-red">{alerts.length}</span>
          )}
        </CardTitle>
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <span className="text-2xl block mb-2">✓</span>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active alerts — all limits healthy!</p>
          </div>
        ) : alerts.map((a, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0"
               style={{ borderColor: 'var(--border)' }}>
            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[15px] flex-shrink-0"
                 style={{ background: a.color }}>
              {a.icon}
            </div>
            <div>
              <p className="text-[13px] font-medium" style={{ color: a.tc }}>{a.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.sub}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
