import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTransactions } from '@/hooks/useTransactions'
import { Card, CardTitle, StatCard, EmptyState, Skeleton, Badge } from '@/components/ui'
import { BarChart, DonutChart, CategoryBars } from '@/components/charts'
import { fmt, fmtFull, getMonthTxns, calcPredictions } from '@/utils'
import { MONTHS, CATEGORIES } from '@/lib/constants'
import type { Transaction } from '@/types'

function HeroCard({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div
      className={`hcard ${className ?? ''}`}
      style={style}
    >
      {children}
    </div>
  )
}

function TxnRow({ txn, index }: { txn: Transaction; index: number }) {
  const c = useMemo(() => {
    return CATEGORIES[txn.category as keyof typeof CATEGORIES] ?? CATEGORIES.Other
  }, [txn.category])

  return (
    <div
      className="flex items-center gap-3.5 py-3 border-b last:border-0 transition-all duration-200 hover:pl-1.5 animate-slide-in"
      style={{ borderColor: 'var(--border)', animationDelay: `${index * 0.05}s` }}
    >
      <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center text-lg flex-shrink-0"
           style={{ background: c.bg }}>
        {c.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {txn.description}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {txn.category} · {txn.date}
        </p>
      </div>
      <span className={`text-[15px] font-semibold flex-shrink-0 ${txn.type === 'expense' ? 'text-brand-red' : 'text-brand-green'}`}>
        {txn.type === 'expense' ? '-' : '+'}{fmt(txn.amount)}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { txns, catLimits, loading } = useTransactions()
  const now = new Date()

  const mt      = useMemo(() => getMonthTxns(txns), [txns])
  const income   = mt.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = mt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance  = income - expenses
  const savRate  = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0

  const catMap = useMemo(() => {
    const m: Record<string, number> = {}
    mt.filter(t => t.type === 'expense').forEach(t => { m[t.category] = (m[t.category] ?? 0) + t.amount })
    return m
  }, [mt])

  const recent  = useMemo(() => [...mt].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [mt])

  const chartData7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i))
      const k = d.toISOString().split('T')[0]
      const val = txns.filter(t => t.date === k && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return { label: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], value: val, isHighlight: i === 6 }
    })
  }, [txns])

  const pred = useMemo(() => calcPredictions(txns, catLimits), [txns, catLimits])

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid gap-5" style={{ gridTemplateColumns: '1.6fr 1fr 1fr' }}>
          {[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="screen flex flex-col gap-5">
      {/* Hero cards */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1.6fr 1fr 1fr' }}>
        <HeroCard
          style={{ background: 'linear-gradient(135deg,#0f1729,#1a1040,#0d1a38)' }}
        >
          <div className="absolute right-6 top-6 w-11 h-11 rounded-[13px] flex items-center justify-center text-xl"
               style={{ background: 'rgba(108,99,255,0.2)' }}>💳</div>
          <p className="text-xs tracking-wide mb-2.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Net Balance</p>
          <p className="hcard-amount text-[40px]" style={{ fontSize: 40 }}>
            {balance < 0 ? '-' : ''}₨{Math.abs(Math.round(balance)).toLocaleString('en-PK')}
          </p>
          <p className="text-xs mt-1.5 relative" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {MONTHS[now.getMonth()]} {now.getFullYear()}
          </p>
          <Badge variant={balance >= 0 ? 'green' : 'red'} >
            {balance >= 0 ? '↑ On track' : '↓ Over budget'}
          </Badge>
        </HeroCard>

        <HeroCard style={{ background: 'linear-gradient(135deg,#071a14,#0a2218)' }}>
          <div className="absolute right-6 top-6 w-11 h-11 rounded-[13px] flex items-center justify-center text-xl"
               style={{ background: 'rgba(0,214,143,0.15)' }}>↓</div>
          <p className="text-xs tracking-wide mb-2.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Income</p>
          <p className="hcard-amount">{fmtFull(income)}</p>
          <p className="text-xs mt-1.5 relative" style={{ color: 'rgba(255,255,255,0.4)' }}>This month</p>
        </HeroCard>

        <HeroCard style={{ background: 'linear-gradient(135deg,#1a0810,#200d14)' }}>
          <div className="absolute right-6 top-6 w-11 h-11 rounded-[13px] flex items-center justify-center text-xl"
               style={{ background: 'rgba(255,92,122,0.15)' }}>↑</div>
          <p className="text-xs tracking-wide mb-2.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Expenses</p>
          <p className="hcard-amount">{fmtFull(expenses)}</p>
          <p className="text-xs mt-1.5 relative" style={{ color: 'rgba(255,255,255,0.4)' }}>This month</p>
        </HeroCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <CardTitle action={<Link to="/transactions" className="text-[#8b85ff] hover:underline">View all →</Link>}>
            Recent Transactions
          </CardTitle>
          {recent.length === 0
            ? <EmptyState icon="💳" text="No transactions yet. Tap + to add one." />
            : recent.map((t, i) => <TxnRow key={t.id} txn={t} index={i} />)
          }
        </Card>

        <Card>
          <CardTitle>Spending by Category</CardTitle>
          {Object.keys(catMap).length === 0
            ? <EmptyState icon="📊" text="No expenses yet." />
            : <CategoryBars data={catMap} />
          }
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <CardTitle>7-Day Trend</CardTitle>
          <BarChart data={chartData7} height={110} />
        </Card>

        <Card>
          <CardTitle>Month Snapshot</CardTitle>
          <div className="flex gap-3.5 mb-5">
            <StatCard label="Savings Rate" value={`${savRate}%`}
                      color={savRate >= 0 ? '#00d68f' : '#ff5c7a'} />
            <StatCard label="Avg / Day"    value={fmt(expenses / Math.max(now.getDate(), 1))} />
            <StatCard label="Transactions" value={mt.length.toString()} />
          </div>
          <DonutChart data={catMap} />
        </Card>
      </div>

      {/* AI Snapshot */}
      <div
        className="rounded-card p-6"
        style={{
          background: 'linear-gradient(135deg,#071520,#0b1c2c)',
          border: '1px solid rgba(0,201,177,0.18)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
            ◑ AI Forecast Snapshot
          </h3>
          <Link to="/predictions" className="text-xs" style={{ color: '#00c9b1' }}>Full report →</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Projected Spend', value: fmt(pred.projectedMonthEnd), color: pred.projectedMonthEnd > pred.totalBudget ? '#ff5c7a' : '#00c9b1', icon: '◑' },
            { label: 'Projected Savings', value: fmt(pred.projectedSavings), color: '#00d68f', icon: '◎' },
            { label: 'Daily Burn Rate',   value: `${fmt(pred.dailyRate)}/day`, color: '#ffb84d', icon: '⚡' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4"
                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] mb-1.5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {s.icon} {s.label}
              </p>
              <p className="font-display text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
