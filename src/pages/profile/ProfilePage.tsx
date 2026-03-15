import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTransactions } from '@/hooks/useTransactions'
import { useToast } from '@/context/ToastContext'
import { Card, CardTitle, Input, Button } from '@/components/ui'
import { fmt, getInitials, getAvatarGradient, exportToCSV } from '@/utils'

export default function ProfilePage() {
  const { user, profile, updateProfile, updatePassword, signOut } = useAuth()
  const { txns, clearAllTransactions } = useTransactions()
  const { toast } = useToast()

  const fname0 = profile?.fname ?? ''
  const lname0 = profile?.lname ?? ''

  const [fname, setFname]   = useState(fname0)
  const [lname, setLname]   = useState(lname0)
  const [income, setIncome] = useState(String(profile?.monthly_income ?? 0))
  const [pass, setPass]     = useState('')
  const [saving, setSaving] = useState(false)

  const ini  = getInitials(fname || fname0 || (user?.email?.[0] ?? '?'), lname || lname0)
  const grad = getAvatarGradient(fname || fname0 || 'User')

  const allInc = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const allExp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  async function handleSave() {
    if (!fname) { toast('First name is required.', 'error'); return }
    setSaving(true)
    const { error } = await updateProfile({ fname, lname, monthly_income: parseFloat(income) || 0 })
    if (error) { toast(error, 'error'); setSaving(false); return }
    if (pass.length >= 6) {
      const { error: pe } = await updatePassword(pass)
      if (pe) { toast(pe, 'error'); setSaving(false); return }
      setPass('')
    } else if (pass.length > 0) {
      toast('Password must be at least 6 characters.', 'error'); setSaving(false); return
    }
    toast('Profile saved ✓')
    setSaving(false)
  }

  async function handleClearData() {
    if (!confirm('Delete ALL transactions? This cannot be undone.')) return
    await clearAllTransactions()
    toast('All transactions deleted.', 'info')
  }

  function handleExportAll() {
    exportToCSV(txns, 'finio-all-transactions.csv')
    toast('All transactions exported ✓')
  }

  return (
    <div className="screen grid grid-cols-2 gap-5">
      {/* Left: edit form */}
      <Card>
        <CardTitle>Account Details</CardTitle>

        {/* Avatar */}
        <div className="text-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-3"
            style={{ background: grad }}
          >
            {ini}
          </div>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {fname} {lname}
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={fname} onChange={e => setFname(e.target.value)} />
            <Input label="Last Name"  value={lname} onChange={e => setLname(e.target.value)} />
          </div>
          <Input
            label="Monthly Income (PKR)"
            type="number"
            value={income}
            onChange={e => setIncome(e.target.value)}
          />
          <Input
            label="New Password (leave blank to keep current)"
            type="password"
            placeholder="Min. 6 characters"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
        </div>

        <Button variant="primary" onClick={handleSave} loading={saving}
                className="w-full justify-center py-3.5 mt-6">
          Save Changes
        </Button>
      </Card>

      {/* Right: stats + danger */}
      <div className="flex flex-col gap-5">
        <Card>
          <CardTitle>Account Stats</CardTitle>
          {[
            { icon: '⇄', label: 'Total Transactions', value: txns.length.toString() },
            { icon: '↓', label: 'Total Income Logged',   value: fmt(allInc) },
            { icon: '↑', label: 'Total Expenses Logged', value: fmt(allExp) },
            { icon: '📅', label: 'Member Since', value: user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long' })
              : 'N/A'
            },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 py-3 border-b last:border-0"
                 style={{ borderColor: 'var(--border)' }}>
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[14px] flex-shrink-0"
                   style={{ background: 'rgba(255,255,255,0.04)' }}>
                {s.icon}
              </div>
              <div className="flex-1">
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                <p className="text-[14px] font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            </div>
          ))}

          <Button variant="ghost" onClick={handleExportAll} className="w-full justify-center mt-4">
            ↓ Export All Transactions CSV
          </Button>
        </Card>

        <Card style={{ background: 'rgba(255,92,122,0.05)', borderColor: 'rgba(255,92,122,0.2)' }}>
          <CardTitle>
            <span style={{ color: '#ff5c7a' }}>Danger Zone</span>
          </CardTitle>
          <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>
            Permanently delete your data. These actions cannot be undone.
          </p>
          <Button variant="danger" onClick={handleClearData} className="w-full justify-center mb-2">
            🗑 Delete All Transactions
          </Button>
          <button
            onClick={signOut}
            className="w-full py-2.5 text-[13px] rounded-[var(--radius)] transition-colors"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'none' }}
          >
            Sign out of this device
          </button>
        </Card>
      </div>
    </div>
  )
}
