import type { Transaction, Prediction, Insight, CatLimits } from '@/types'
import { CATEGORIES } from '@/lib/constants'

// ─── PKR Formatting ─────────────────────────────────────────────────────────

export function fmt(n: number): string {
  const abs = Math.abs(n)
  let s: string
  if (abs >= 10_000_000) s = '₨' + (abs / 10_000_000).toFixed(1) + 'cr'
  else if (abs >= 100_000) s = '₨' + (abs / 100_000).toFixed(1) + 'L'
  else if (abs >= 1_000)   s = '₨' + (abs / 1_000).toFixed(1) + 'K'
  else s = '₨' + Math.round(abs).toLocaleString('en-PK')
  return (n < 0 ? '-' : '') + s
}

export function fmtFull(n: number): string {
  return (n < 0 ? '-' : '') + '₨' + Math.abs(Math.round(n)).toLocaleString('en-PK')
}

export function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ─── Date helpers ────────────────────────────────────────────────────────────

export function getMonthTxns(txns: Transaction[], offset = 0): Transaction[] {
  const now = new Date()
  const year  = now.getFullYear() + (now.getMonth() + offset < 0 ? -1 : 0)
  const month = ((now.getMonth() + offset) % 12 + 12) % 12
  return txns.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === month && d.getFullYear() === year
  })
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Initials / Avatar ───────────────────────────────────────────────────────

export function getInitials(fname: string, lname: string): string {
  return ((fname[0] ?? '?') + (lname[0] ?? '')).toUpperCase()
}

export function getAvatarGradient(name: string): string {
  const colors = [
    'linear-gradient(135deg,#6c63ff,#ff6ec7)',
    'linear-gradient(135deg,#00d68f,#38b6ff)',
    'linear-gradient(135deg,#ff5c7a,#ffb84d)',
    'linear-gradient(135deg,#00c9b1,#6c63ff)',
  ]
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xff
  return colors[h % colors.length]
}

// ─── Prediction Engine ───────────────────────────────────────────────────────

export function calcPredictions(txns: Transaction[], catLimits: CatLimits): Prediction {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysPassed  = now.getDate()
  const daysLeft    = daysInMonth - daysPassed

  const mt      = getMonthTxns(txns)
  const income   = mt.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = mt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const dailyRate       = daysPassed > 0 ? expenses / daysPassed : 0
  const projectedMonthEnd = expenses + (dailyRate * daysLeft)
  const projectedSavings  = Math.max(income - projectedMonthEnd, 0)
  const totalBudget       = Object.values(catLimits).reduce((s, v) => s + v, 0)
  const dailyTarget       = daysLeft > 0 ? Math.max(totalBudget - expenses, 0) / daysLeft : 0

  const catMap: Record<string, number> = {}
  mt.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] ?? 0) + t.amount
  })

  const catProjections: Record<string, number> = {}
  Object.entries(catMap).forEach(([cat, spent]) => {
    catProjections[cat] = daysPassed > 0 ? spent + (spent / daysPassed) * daysLeft : spent
  })

  return {
    projectedMonthEnd, projectedSavings, dailyTarget, dailyRate,
    daysLeft, daysPassed, daysInMonth, income, expenses,
    catMap, catProjections, totalBudget,
  }
}

export function buildInsights(
  pred: Prediction,
  catLimits: CatLimits,
): Insight[] {
  const { catMap, catProjections, projectedMonthEnd, totalBudget, dailyRate, income, daysLeft } = pred
  const ins: Insight[] = []

  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]
  if (topCat) {
    const [cat, amt] = topCat
    const lim = catLimits[cat] ?? 999999
    const pct = Math.round((amt / lim) * 100)
    if (pct > 75) ins.push({
      type: 'warn',
      title: `${cat} at ${pct}% of budget`,
      body: `Spent ${fmt(amt)} on ${cat}. Projected: ${fmt(catProjections[cat] ?? amt)} vs limit ${fmt(lim)}.`,
      badge: '⚠ Watch', badgeBg: 'rgba(255,184,77,0.12)', badgeColor: '#ffb84d', confidence: 86,
    })
  }

  if (projectedMonthEnd > totalBudget) {
    ins.push({
      type: 'danger',
      title: 'Month-end overrun projected',
      body: `At ${fmt(dailyRate)}/day you'll exceed total budget by ${fmt(projectedMonthEnd - totalBudget)}. Cut ${fmt((projectedMonthEnd - totalBudget) / Math.max(daysLeft, 1))}/day.`,
      badge: '🔴 High Risk', badgeBg: 'rgba(255,92,122,0.12)', badgeColor: '#ff5c7a', confidence: 92,
    })
  } else {
    ins.push({
      type: 'good',
      title: 'Budget on track',
      body: `Projected to finish ${fmt(totalBudget - projectedMonthEnd)} under budget with ${daysLeft} days left.`,
      badge: '✓ Healthy', badgeBg: 'rgba(0,214,143,0.12)', badgeColor: '#00d68f', confidence: 84,
    })
  }

  if (income > 0) {
    const saved = Math.max(income - projectedMonthEnd, 0)
    const rate  = Math.round((saved / income) * 100)
    ins.push({
      type: 'info',
      title: `${rate}% savings rate projected`,
      body: rate < 20
        ? `Cut ${fmt(dailyRate * 0.1)}/day to reach a 20% savings rate.`
        : `Excellent! Consider putting ${fmt(saved * 0.3)} into savings.`,
      badge: '💡 Tip', badgeBg: 'rgba(56,182,255,0.12)', badgeColor: '#38b6ff', confidence: 78,
    })
  }

  return ins.slice(0, 4)
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

export function exportToCSV(txns: Transaction[], filename = 'finio-transactions.csv'): void {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (PKR)']
  const rows = txns
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.amount.toString(),
    ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Category helpers ────────────────────────────────────────────────────────

export function getCat(name: string) {
  return CATEGORIES[name as keyof typeof CATEGORIES] ?? CATEGORIES.Other
}
