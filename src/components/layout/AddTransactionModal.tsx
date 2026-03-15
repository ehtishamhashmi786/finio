import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from '@/components/ui'
import { useTransactions } from '@/hooks/useTransactions'
import { useToast } from '@/context/ToastContext'
import { CATEGORY_NAMES } from '@/lib/constants'
import type { Category } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
}

export default function AddTransactionModal({ open, onClose }: Props) {
  const { addTransaction, controls } = useTransactions()
  const { toast } = useToast()

  const [type, setType]     = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [desc, setDesc]     = useState('')
  const [category, setCat]  = useState<Category>('Food')
  const [date, setDate]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().split('T')[0])
      setAmount('')
      setDesc('')
      setType('expense')
      setCat('Food')
    }
  }, [open])

  async function handleSave() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0 || !desc.trim() || !date) {
      toast('Please fill in all fields.', 'error')
      return
    }
    setLoading(true)
    const result = await addTransaction({ description: desc.trim(), amount: amt, type, category, date })
    setLoading(false)
    if (!result) { toast('Error saving transaction.', 'error'); return }
    toast('Transaction saved ✓')
    onClose()
  }

  const typeBtn = (t: 'expense' | 'income', label: string, activeClass: string) => (
    <button
      type="button"
      onClick={() => setType(t)}
      className="flex-1 py-2.5 rounded-[var(--radius)] text-[13px] font-medium transition-all duration-200"
      style={{
        border: `1px solid ${type === t
          ? (t === 'expense' ? 'rgba(255,92,122,0.4)' : 'rgba(0,214,143,0.4)')
          : 'var(--border)'}`,
        background: type === t
          ? (t === 'expense' ? 'rgba(255,92,122,0.12)' : 'rgba(0,214,143,0.12)')
          : 'var(--bg-tertiary)',
        color: type === t ? (t === 'expense' ? '#ff5c7a' : '#00d68f') : 'var(--text-secondary)',
      }}
    >
      {label}
    </button>
  )

  return (
    <Modal open={open} onClose={onClose} title="New Transaction">
      {/* No-spend warning */}
      {controls.nospend.on && type === 'expense' && (
        <div className="mb-4 p-3 rounded-[var(--radius)] text-[13px]"
             style={{ background: 'rgba(255,92,122,0.12)', border: '1px solid rgba(255,92,122,0.3)', color: '#ff5c7a' }}>
          🔒 No-Spend Mode is active. Are you sure you want to add an expense?
        </div>
      )}

      {/* Type toggle */}
      <div className="flex gap-2 mb-4">
        {typeBtn('expense', '↑ Expense', 'expense')}
        {typeBtn('income',  '↓ Income',  'income')}
      </div>

      <div className="grid grid-cols-2 gap-3.5 mb-4">
        <Input
          label="Amount (PKR)"
          type="number"
          placeholder="0"
          min="0"
          step="1"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <Input
          label="Description"
          placeholder="e.g. Biryani, Salary, Petrol…"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
        />
      </div>

      <Select
        label="Category"
        value={category}
        onChange={e => setCat(e.target.value as Category)}
      >
        {CATEGORY_NAMES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </Select>

      <div className="flex gap-2.5 mt-6">
        <Button variant="ghost" onClick={onClose} className="flex-1 justify-center py-3">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} loading={loading} className="flex-1 justify-center py-3">
          Save Transaction
        </Button>
      </div>
    </Modal>
  )
}
