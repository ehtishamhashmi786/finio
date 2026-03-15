import { useLocation } from 'react-router-dom'
import { MONTHS } from '@/lib/constants'
import { Button } from '@/components/ui'

const PAGE_TITLES: Record<string, string> = {
  '/':             'Dashboard',
  '/transactions': 'Transactions',
  '/analytics':   'Analytics',
  '/budgets':     'Budgets',
  '/predictions': 'Predictions',
  '/controls':    'Spend Control',
  '/profile':     'My Profile',
}

interface TopbarProps {
  onAddTransaction: () => void
}

export default function Topbar({ onAddTransaction }: TopbarProps) {
  const { pathname } = useLocation()
  const now = new Date()
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-8 h-16"
      style={{
        background: 'rgba(8,11,18,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <h1 className="font-display text-lg font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}>
        {PAGE_TITLES[pathname] ?? 'Finio'}
      </h1>

      <div className="flex items-center gap-3">
        <span
          className="text-[13px] px-3 py-2 rounded-[var(--radius)]"
          style={{
            color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
          }}
        >
          {monthLabel}
        </span>
        <Button onClick={onAddTransaction}>
          <span className="text-lg leading-none">+</span>
          Add Transaction
        </Button>
      </div>
    </header>
  )
}
