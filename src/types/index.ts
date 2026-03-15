// ─── Database row types (mirror Supabase schema) ───────────────────────────

export interface Profile {
  id: string
  fname: string
  lname: string
  monthly_income: number
  created_at: string
}

export interface Transaction {
  id: number
  user_id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: Category
  date: string
  created_at: string
}

export interface UserSettings {
  user_id: string
  controls: Controls
  cat_limits: CatLimits
  updated_at: string
}

// ─── App types ──────────────────────────────────────────────────────────────

export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Bills'
  | 'Salary'
  | 'Other'

export interface CategoryMeta {
  icon: string
  color: string
  bg: string
  label: string
}

export interface Controls {
  daily:   { on: boolean; limit: number }
  weekly:  { on: boolean; limit: number }
  savings: { on: boolean; limit: number }
  nospend: { on: boolean }
}

export type CatLimits = Record<string, number>

export type TxnFilter = 'all' | 'income' | 'expense'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

export interface Prediction {
  projectedMonthEnd: number
  projectedSavings: number
  dailyTarget: number
  dailyRate: number
  daysLeft: number
  daysPassed: number
  daysInMonth: number
  income: number
  expenses: number
  catMap: Record<string, number>
  catProjections: Record<string, number>
  totalBudget: number
}

export interface Insight {
  type: 'warn' | 'danger' | 'good' | 'info'
  title: string
  body: string
  badge: string
  badgeBg: string
  badgeColor: string
  confidence: number
}

// ─── Theme ──────────────────────────────────────────────────────────────────
export type Theme = 'dark' | 'light'
