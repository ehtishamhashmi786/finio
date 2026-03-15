import { useMemo } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { Card, CardTitle, StatCard } from '@/components/ui'
import { BarChart, DonutChart, CategoryBars } from '@/components/charts'
import { fmt, fmtFull, getMonthTxns } from '@/utils'

export default function AnalyticsPage() {
  const { txns } = useTransactions()
  const now = new Date()

  const mt = useMemo(() => getMonthTxns(txns), [txns])
  const income   = mt.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = mt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savRate  = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0

  const catMap = useMemo(() => {
    const m: Record<string, number> = {}
    mt.filter(t => t.type === 'expense').forEach(t => { m[t.category] = (m[t.category] ?? 0) + t.amount })
    return m
  }, [mt])

  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const chart30 = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (29 - i))
      const k = d.toISOString().split('T')[0]
      const val = txns.filter(t => t.date === k && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return { label: d.getDate().toString(), value: val, isHighlight: i === 29 }
    })
  }, [txns])

  return (
    <div className="screen flex flex-col gap-5">
      {/* Stat row */}
      <div className="flex gap-3.5">
        <StatCard label="Savings Rate"    value={`${savRate}%`}          color={savRate >= 0 ? '#00d68f' : '#ff5c7a'} />
        <StatCard label="Avg Daily Spend" value={fmt(expenses / Math.max(now.getDate(), 1))} />
        <StatCard label="Top Category"    value={topCat} />
        <StatCard label="Total Saved"     value={fmtFull(Math.max(income - expenses, 0))} color="#00d68f" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <CardTitle>30-Day Spending Trend</CardTitle>
          <BarChart data={chart30} height={150} />
        </Card>
        <Card>
          <CardTitle>Expense Distribution</CardTitle>
          <DonutChart data={catMap} size={130} />
        </Card>
      </div>

      {/* Category breakdown */}
      <Card>
        <CardTitle>Category Breakdown</CardTitle>
        {Object.keys(catMap).length === 0
          ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No expense data this month.</p>
          : <CategoryBars data={catMap} showShare />
        }
      </Card>
    </div>
  )
}
