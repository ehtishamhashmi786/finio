import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import { Input, Button } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { signIn, signInWithGoogle, resetPassword } = useAuth()
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoad]  = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin() {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) setError(err)
  }

  async function handleGoogle() {
    setGLoad(true)
    await signInWithGoogle()
  }

  async function handleForgot() {
    if (!email) { setError('Enter your email address first.'); return }
    const { error: err } = await resetPassword(email)
    if (err) setError(err)
    else setSuccess('Password reset email sent! Check your inbox.')
  }

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Pakistan's smartest personal finance tracker"
      switchText="Don't have an account?"
      switchLink="/signup"
      switchLabel="Create one →"
    >
      {error && (
        <div className="mb-4 p-3 rounded-[var(--radius)] text-[13px]"
             style={{ background: 'rgba(255,92,122,0.1)', border: '1px solid rgba(255,92,122,0.25)', color: '#ff5c7a' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-[var(--radius)] text-[13px]"
             style={{ background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.25)', color: '#00d68f' }}>
          {success}
        </div>
      )}

      <div className="flex flex-col gap-4 mb-2">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
        />
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
          />
          <button
            type="button"
            onClick={handleForgot}
            className="mt-1.5 text-[12px] text-right w-full"
            style={{ color: '#8b85ff' }}
          >
            Forgot password?
          </button>
        </div>
      </div>

      <Button variant="primary" onClick={handleLogin} loading={loading} className="w-full justify-center py-3.5 text-[15px]">
        Sign In →
      </Button>

      <div className="flex items-center gap-3 my-5" style={{ color: 'var(--text-muted)' }}>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs">or</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <Button
        variant="ghost"
        onClick={handleGoogle}
        loading={gLoading}
        className="w-full justify-center py-3 text-[14px]"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-4 h-4" />
        Continue with Google
      </Button>
    </AuthLayout>
  )
}
