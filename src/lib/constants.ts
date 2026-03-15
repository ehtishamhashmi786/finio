import type { Category, CategoryMeta, CatLimits, Controls } from '@/types'

export const CATEGORIES: Record<Category, CategoryMeta> = {
  Food:          { icon: '🍔', color: '#6c63ff', bg: 'rgba(108,99,255,0.12)', label: 'Food & Dining' },
  Transport:     { icon: '🚗', color: '#00d68f', bg: 'rgba(0,214,143,0.12)',  label: 'Transport' },
  Shopping:      { icon: '🛍️', color: '#ff9f6b', bg: 'rgba(255,159,107,0.12)',label: 'Shopping' },
  Entertainment: { icon: '🎬', color: '#ffb84d', bg: 'rgba(255,184,77,0.12)', label: 'Entertainment' },
  Health:        { icon: '💊', color: '#ff6ec7', bg: 'rgba(255,110,199,0.12)',label: 'Health' },
  Bills:         { icon: '💡', color: '#38b6ff', bg: 'rgba(56,182,255,0.12)', label: 'Bills & Utilities' },
  Salary:        { icon: '💼', color: '#00d68f', bg: 'rgba(0,214,143,0.12)',  label: 'Salary' },
  Other:         { icon: '📦', color: '#8890a8', bg: 'rgba(136,144,168,0.12)',label: 'Other' },
}

export const CATEGORY_NAMES = Object.keys(CATEGORIES) as Category[]

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export const DEFAULT_CAT_LIMITS: CatLimits = {
  Food: 15000,
  Transport: 8000,
  Shopping: 10000,
  Entertainment: 5000,
  Bills: 12000,
}

export const DEFAULT_CONTROLS: Controls = {
  daily:   { on: false, limit: 3000 },
  weekly:  { on: false, limit: 15000 },
  savings: { on: true,  limit: 20000 },
  nospend: { on: false },
}
