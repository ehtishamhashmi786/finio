import { useState } from 'react'
import AuthLayout from '@/components/layout/AuthLayout'
import { Input, Button } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const [fname, setFname]   = useState('')
  const [lname, setLname]   = useState('')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [income, setIncome] = useState('')
  const [loading, setLoad]  = useState(false)
  const [gLoading, setGL]   = useState(false)
  const [error, setError]   = useState('')
  const [success, setOk]    = useState('')

  async function handleSignup() {
    if (!fname || !lname || !email || !pass) { setError('Please fill in all fields.'); return }
    if (pass.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoad(true); setError('')
    const { error: err } = await signUp(email, pass, {
      fname, lname, monthly_income: parseFloat(income) || 0
    })
    setLoad(false)
    if (err) { setError(err); return }
    setOk('Account created! Check your email to confirm, then sign in.')
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Pakistan's smartest personal finance tracker"
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign in →"
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
        <div className="grid grid-cols-2 gap-3">
          <Input label="First Name" placeholder="Ali"    value={fname} onChange={e => setFname(e.target.value)} autoComplete="given-name" />
          <Input label="Last Name"  placeholder="Hassan" value={lname} onChange={e => setLname(e.target.value)} autoComplete="family-name" />
        </div>
        <Input label="Email"    type="email"    placeholder="you@example.com" value={email}  onChange={e => setEmail(e.target.value)}  autoComplete="email" />
        <Input label="Password" type="password" placeholder="Min. 6 characters" value={pass} onChange={e => setPass(e.target.value)}   autoComplete="new-password" />
        <Input label="Monthly Income (PKR)" type="number" placeholder="e.g. 80000" value={income} onChange={e => setIncome(e.target.value)} />
      </div>

      <Button variant="primary" onClick={handleSignup} loading={loading} className="w-full justify-center py-3.5 text-[15px]">
        Create Account →
      </Button>

      <div className="flex items-center gap-3 my-5" style={{ color: 'var(--text-muted)' }}>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs">or</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <Button variant="ghost" onClick={async () => { setGL(true); await signInWithGoogle() }} loading={gLoading}
              className="w-full justify-center py-3 text-[14px]">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-4 h-4" />
        Continue with Google
      </Button>
    </AuthLayout>
  )
}
