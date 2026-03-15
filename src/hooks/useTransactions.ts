import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DEFAULT_CAT_LIMITS, DEFAULT_CONTROLS } from '@/lib/constants'
import type { Transaction, Controls, CatLimits } from '@/types'
import { useAuth } from '@/context/AuthContext'

interface UseTransactionsReturn {
  txns: Transaction[]
  controls: Controls
  catLimits: CatLimits
  loading: boolean
  addTransaction: (txn: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<Transaction | null>
  deleteTransaction: (id: number) => Promise<void>
  updateControls: (key: keyof Controls, value: Controls[keyof Controls]) => void
  updateCatLimit: (cat: string, value: number) => void
  saveSettings: () => Promise<void>
  clearAllTransactions: () => Promise<void>
  refetch: () => Promise<void>
}

export function useTransactions(): UseTransactionsReturn {
  const { user } = useAuth()
  const [txns, setTxns]             = useState<Transaction[]>([])
  const [controls, setControls]     = useState<Controls>(DEFAULT_CONTROLS)
  const [catLimits, setCatLimits]   = useState<CatLimits>(DEFAULT_CAT_LIMITS)
  const [loading, setLoading]       = useState(true)
  const saveTimer                   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Load last 3 months of transactions
    const from = new Date()
    from.setMonth(from.getMonth() - 2)
    from.setDate(1)
    const fromStr = from.toISOString().split('T')[0]

    const [txnRes, settingsRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', fromStr)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single(),
    ])

    if (txnRes.data) setTxns(txnRes.data as Transaction[])
    if (settingsRes.data) {
      setControls({ ...DEFAULT_CONTROLS, ...settingsRes.data.controls })
      setCatLimits({ ...DEFAULT_CAT_LIMITS, ...settingsRes.data.cat_limits })
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Realtime subscription
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`transactions:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        setTxns(prev => [payload.new as Transaction, ...prev])
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        setTxns(prev => prev.filter(t => t.id !== (payload.old as Transaction).id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  async function addTransaction(txn: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) {
    if (!user) return null
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...txn, user_id: user.id })
      .select()
      .single()
    if (error || !data) return null
    return data as Transaction
  }

  async function deleteTransaction(id: number) {
    if (!user) return
    await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)
    setTxns(prev => prev.filter(t => t.id !== id))
  }

  function updateControls(key: keyof Controls, value: Controls[keyof Controls]) {
    setControls(prev => {
      const next = { ...prev, [key]: value }
      scheduleSave(next, catLimits)
      return next
    })
  }

  function updateCatLimit(cat: string, value: number) {
    setCatLimits(prev => {
      const next = { ...prev, [cat]: value }
      scheduleSave(controls, next)
      return next
    })
  }

  function scheduleSave(c: Controls, l: CatLimits) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => persistSettings(c, l), 800)
  }

  async function persistSettings(c: Controls, l: CatLimits) {
    if (!user) return
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      controls: c,
      cat_limits: l,
      updated_at: new Date().toISOString(),
    })
  }

  async function saveSettings() {
    await persistSettings(controls, catLimits)
  }

  async function clearAllTransactions() {
    if (!user) return
    await supabase.from('transactions').delete().eq('user_id', user.id)
    setTxns([])
  }

  return {
    txns, controls, catLimits, loading,
    addTransaction, deleteTransaction,
    updateControls, updateCatLimit,
    saveSettings, clearAllTransactions,
    refetch: fetchAll,
  }
}
