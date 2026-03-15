import { useMemo } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { Card, CardTitle, Badge } from '@/components/ui'
import { ForecastChart } from '@/components/charts'
import { fmt, fmtFull, calcPredictions, buildInsights } from '@/utils'
import { CATEGORIES } from '@/lib/constants'

export default function PredictionsPage() {
  const { txns, catLimits } = useTransactions()
  const now = new Date()

  const pred = useMemo(() => calcPredictions(txns, catLimits), [txns, catLimits])
  const insights = useMemo(() => buildInsights(pred, catLimits), [pred, catLimits])

  const { projectedMonthEnd, projectedSavings, dailyTarget, dailyRate, daysLeft, daysPassed, daysInMonth, income, catMap, catProjections, totalBudget } = pred
  const over = projectedMonthEnd > totalBudget

  // Build forecast data
  const forecastData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day  = i + 1
      const date = new Date(now.getFullYear(), now.getMonth(), day).toISOString().split('T')[0]
      const value = day <= daysPassed
        ? txns.filter(t => t.date === date && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
        : null
      return { day, value }
    })
  }, [txns, daysInMonth, daysPassed])

  const nme = projectedMonthEnd * 1.03
  const nms = Math.max(income - nme, 0)
  const nmr = income > 0 ? Math.max(0, Math.round(((income - nme) / income) * 100)) : 0

  return (
    <div className="screen flex flex-col gap-5">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full mb-1"
           style={{ color: '#00c9b1', background: 'rgba(0,201,177,0.12)' }}>
        ◑ AI Prediction Engine · Spend velocity analysis
      </div>
      <p className="text-[13px] -mt-3" style={{ color: 'var(--text-muted)' }}>
        Forecasts computed from your daily burn rate, category patterns and historical averages.
      </p>

      {/* Hero cards */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1.6fr 1fr 1fr' }}>
        <div className="hcard" style={{ background: 'linear-gradient(135deg,#071520,#0a1f30)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%,rgba(0,201,177,0.2),transparent 60%)' }} />
          <div className="absolute right-6 top-6 w-11 h-11 rounded-[13px] flex items-center justify-center text-xl"
               style={{ background: 'rgba(0,201,177,0.15)' }}>◑</div>
          <p className="text-xs tracking-wide mb-2.5 relative" style={{ color: 'rgba(255,255,255,0.55)' }}>Projected Month-End Spend</p>
          <p className="hcard-amount relative" style={{ fontSize: 34 }}>{fmtFull(projectedMonthEnd)}</p>
          <p className="text-xs mt-1.5 relative" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Burn: {fmt(dailyRate)}/day · {daysLeft} days left
          </p>
          <Badge variant={over ? 'red' : 'teal'}>
            {over ? '▲ Over budget projected' : '✓ Within budget'}
          </Badge>
        </div>

        <div className="hcard" style={{ background: 'linear-gradient(135deg,#0a1a0a,#0d200d)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%,rgba(0,214,143,0.15),transparent 60%)' }} />
          <div className="absolute right-6 top-6 w-11 h-11 rounded-[13px] flex items-center justify-center text-xl"
               style={{ background: 'rgba(0,214,143,0.15)' }}>◎</div>
          <p className="text-xs tracking-wide mb-2.5 relative" style={{ color: 'rgba(255,255,255,0.55)' }}>Projected Savings</p>
          <p className="font-display font-extrabold tracking-tight relative" style={{ fontSize: 28, color: '#00d68f' }}>
            {fmtFull(projectedSavings)}
          </p>
          <p className="text-xs mt-1.5 relative" style={{ color: 'rgba(255,255,255,0.4)' }}>If trend continues</p>
        </div>

        <div className="hcard" style={{ background: 'linear-gradient(135deg,#160d0a,#201208)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%,rgba(255,184,77,0.15),transparent 60%)' }} />
          <div className="absolute right-6 top-6 w-11 h-11 rounded-[13px] flex items-center justify-center text-xl"
               style={{ background: 'rgba(255,184,77,0.15)' }}>⚡</div>
          <p className="text-xs tracking-wide mb-2.5 relative" style={{ color: 'rgba(255,255,255,0.55)' }}>Daily Spend Target</p>
          <p className="font-display font-extrabold tracking-tight relative" style={{ fontSize: 28, color: '#ffb84d' }}>
            {fmtFull(dailyTarget)}
          </p>
          <p className="text-xs mt-1.5 relative" style={{ color: 'rgba(255,255,255,0.4)' }}>To stay within budget</p>
        </div>
      </div>

      {/* Forecast chart */}
      <Card>
        <CardTitle>
          <span>Daily Spend — Actual vs Forecast</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-3 h-1 rounded bg-accent" />Actual
            </div>
            <div className="flex items-center gap-1.5 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-3 h-1 rounded opacity-70" style={{ background: '#00c9b1' }} />Forecast
            </div>
          </div>
        </CardTitle>
        <ForecastChart actual={forecastData} forecastValue={dailyRate} height={140} />
      </Card>

      {/* Insights + Cat Forecasts */}
      <div className="grid grid-cols-2 gap-5">
        <div>
          <h3 className="font-display text-[15px] font-bold mb-3.5" style={{ color: 'var(--text-primary)' }}>
            AI Insights
          </h3>
          {insights.map((ins, i) => (
            <div
              key={i}
              className="rounded-card p-5 mb-3.5 transition-all duration-200 hover:translate-x-1"
              style={{
                background: 'var(--bg-tertiary)',
                border: `1px solid var(--border)`,
                borderLeft: `3px solid ${ins.badgeColor}`,
              }}
            >
              <div className="flex justify-between items-start gap-3 mb-2">
                <div>
                  <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{ins.title}</p>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ins.body}</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: ins.badgeBg, color: ins.badgeColor }}>
                  {ins.badge}
                </span>
              </div>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', marginTop: 10 }}>
                <div className="h-full rounded-full" style={{ width: `${ins.confidence}%`, background: 'linear-gradient(90deg,#00c9b1,#6c63ff)' }} />
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Confidence: {ins.confidence}%</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-display text-[15px] font-bold mb-3.5" style={{ color: 'var(--text-primary)' }}>
            Category Forecasts
          </h3>
          {Object.entries(catLimits)
            .map(([cat, limit]) => {
              const spent = catMap[cat] ?? 0
              const proj  = catProjections[cat] ?? spent
              const pct   = Math.round((proj / limit) * 100)
              const c     = CATEGORIES[cat as keyof typeof CATEGORIES] ?? CATEGORIES.Other
              const col   = pct > 100 ? '#ff5c7a' : pct > 75 ? '#ffb84d' : c.color
              const sc    = pct > 100 ? '#ff5c7a' : pct > 75 ? '#ffb84d' : '#00d68f'
              const st    = pct > 100 ? `▲ ${fmt(proj - limit)} over` : pct > 75 ? `⚠ ${fmt(limit - proj)} left` : `✓ ${fmt(limit - proj)} safe`
              return { cat, limit, spent, proj, pct, c, col, sc, st }
            })
            .sort((a, b) => b.pct - a.pct)
            .map(({ cat, limit, spent, proj, pct, c, col, sc, st }) => (
              <div
                key={cat}
                className="rounded-card p-4 mb-3 transition-colors duration-200"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {c.icon} {cat}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: sc }}>{st}</span>
                </div>
                <div className="flex justify-between text-[11px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  <span>Spent: {fmt(spent)}</span>
                  <span>Forecast: {fmt(proj)}</span>
                  <span>Limit: {fmt(limit)}</span>
                </div>
                <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                       style={{ width: `${Math.min(pct, 100)}%`, background: col }} />
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Next month */}
      <div className="rounded-card p-6" style={{ background: 'linear-gradient(135deg,#071520,#0b1c2c)', border: '1px solid rgba(0,201,177,0.18)' }}>
        <h3 className="font-display text-[15px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Next Month Projection</h3>
        <div className="grid grid-cols-4 gap-3.5">
          {[
            { label: 'Projected Income',   val: fmt(income || 120000), color: '#00d68f', icon: '↓' },
            { label: 'Projected Expenses', val: fmt(nme),              color: '#ff5c7a', icon: '↑' },
            { label: 'Expected Savings',   val: fmt(nms),              color: '#00c9b1', icon: '◎' },
            { label: 'Savings Rate',       val: `${nmr}%`,             color: '#8b85ff', icon: '%' },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-xl"
                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.icon} {s.label}</p>
              <p className="font-display text-xl font-bold" style={{ color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
