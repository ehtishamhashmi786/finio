import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import { Input, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pass, setPass]       = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoad]    = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  async function handleReset() {
    if (!pass || pass.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (pass !== confirm) { setError('Passwords do not match.'); return }
    setLoad(true); setError('')
    const { error: err } = await supabase.auth.updateUser({ password: pass })
    setLoad(false)
    if (err) { setError(err.message); return }
    setDone(true)
    setTimeout(() => navigate('/'), 2000)
  }

  return (
    <AuthLayout title="Set New Password" switchText="" switchLink="/login" switchLabel="">
      {done ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">✓</div>
          <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Password updated!</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Redirecting you to the app…</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 rounded-[var(--radius)] text-[13px]"
                 style={{ background: 'rgba(255,92,122,0.1)', border: '1px solid rgba(255,92,122,0.25)', color: '#ff5c7a' }}>
              {error}
            </div>
          )}
          <div className="flex flex-col gap-4 mb-4">
            <Input label="New Password"     type="password" placeholder="Min. 6 characters" value={pass}    onChange={e => setPass(e.target.value)} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password"   value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          <Button variant="primary" onClick={handleReset} loading={loading} className="w-full justify-center py-3.5">
            Update Password
          </Button>
        </>
      )}
    </AuthLayout>
  )
}
