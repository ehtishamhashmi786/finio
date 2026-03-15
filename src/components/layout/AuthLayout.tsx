import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  switchText: string
  switchLink: string
  switchLabel: string
}

export default function AuthLayout({
  children, title, subtitle, switchText, switchLink, switchLabel
}: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background glows */}
      <div className="fixed w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
           style={{ background: 'radial-gradient(circle,rgba(108,99,255,0.5),transparent 70%)', top: -200, right: -100, filter: 'blur(80px)' }} />
      <div className="fixed w-[400px] h-[400px] rounded-full pointer-events-none opacity-20"
           style={{ background: 'radial-gradient(circle,rgba(0,214,143,0.25),transparent 70%)', bottom: 100, left: -100, filter: 'blur(80px)' }} />

      <div
        className="w-full max-w-[440px] rounded-modal p-10 relative z-10 animate-auth-in"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 font-display text-[26px] font-extrabold mb-2"
             style={{ color: 'var(--text-primary)' }}>
          <div className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center text-xl shadow-glow"
               style={{ background: 'linear-gradient(135deg,#6c63ff,#ff6ec7)' }}>
            💰
          </div>
          Finio
        </div>

        {subtitle && (
          <p className="text-[13px] mb-8" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}

        {children}

        {/* Switch form link */}
        <p className="text-center text-[13px] mt-6" style={{ color: 'var(--text-muted)' }}>
          {switchText}{' '}
          <Link to={switchLink} className="font-medium" style={{ color: '#8b85ff' }}>
            {switchLabel}
          </Link>
        </p>
      </div>
    </div>
  )
}
