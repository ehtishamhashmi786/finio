import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { getInitials, getAvatarGradient } from '@/utils'
import { SectionLabel } from '@/components/ui'

const NAV_MAIN = [
  { to: '/',             icon: '⊞', label: 'Dashboard'    },
  { to: '/transactions', icon: '⇄', label: 'Transactions' },
  { to: '/analytics',   icon: '◎', label: 'Analytics'    },
  { to: '/budgets',     icon: '◈', label: 'Budgets'      },
]

const NAV_INTEL = [
  { to: '/predictions', icon: '◑', label: 'Predictions'  },
  { to: '/controls',    icon: '⊙', label: 'Spend Control' },
]

export default function Sidebar() {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const fname = profile?.fname ?? user?.email?.split('@')[0] ?? '?'
  const lname = profile?.lname ?? ''
  const ini   = getInitials(fname, lname)
  const grad  = getAvatarGradient(fname)

  return (
    <aside
      className="flex flex-col py-7 sticky top-0 h-screen overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 pb-8 font-display text-[22px] font-extrabold tracking-tight"
           style={{ color: 'var(--text-primary)' }}>
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base shadow-glow"
             style={{ background: 'linear-gradient(135deg,#6c63ff,#ff6ec7)' }}>
          💰
        </div>
        Finio
      </div>

      {/* Main nav */}
      <nav className="px-4 mb-1.5">
        <SectionLabel>Overview</SectionLabel>
        {NAV_MAIN.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px]"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
              {n.icon}
            </span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3" style={{ height: 1, background: 'var(--border)' }} />

      {/* Intelligence nav */}
      <nav className="px-4 mb-1.5">
        <SectionLabel>Intelligence</SectionLabel>
        {NAV_INTEL.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px]"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
              {n.icon}
            </span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-4 my-3" style={{ height: 1, background: 'var(--border)' }} />

      {/* Settings nav */}
      <nav className="px-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="nav-item w-full"
        >
          <span className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px]"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px]"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
            👤
          </span>
          My Profile
        </NavLink>

        <button
          onClick={signOut}
          className="nav-item w-full"
        >
          <span className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px]"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
            →
          </span>
          Sign Out
        </button>
      </nav>

      {/* User card */}
      <div className="mt-auto px-4">
        <button
          onClick={() => navigate('/profile')}
          className="w-full p-3.5 rounded-[var(--radius)] text-left transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: grad }}
            >
              {ini}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {fname} {lname}
              </p>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {user?.email}
              </p>
            </div>
            <div className="relative w-2 h-2">
              <div className="w-full h-full rounded-full bg-brand-green" />
              <div className="absolute inset-[-3px] rounded-full bg-brand-green opacity-30 animate-pulse-dot" />
            </div>
          </div>
        </button>
      </div>
    </aside>
  )
}
