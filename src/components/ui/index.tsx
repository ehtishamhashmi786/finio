import React from 'react'

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  loading?: boolean
  children: React.ReactNode
}
export function Button({ variant = 'primary', loading, children, className = '', ...props }: ButtonProps) {
  const base = 'btn'
  const v = variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-danger'
  return (
    <button className={`${base} ${v} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
      {children}
    </button>
  )
}

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}
export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
      <input className={`input ${error ? 'border-brand-red!' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-brand-red">{error}</p>}
    </div>
  )
}

// ─── Select ──────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: React.ReactNode
}
export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
      <select
        className={`input cursor-pointer ${className}`}
        style={{ background: 'var(--bg-tertiary)' }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}
export function Card({ children, className = '', style }: CardProps) {
  return <div className={`card ${className}`} style={style}>{children}</div>
}

export function CardTitle({
  children,
  action,
}: {
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-display text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
        {children}
      </h3>
      {action && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{action}</div>}
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'red' | 'amber' | 'teal' | 'blue'
export function Badge({ children, variant }: { children: React.ReactNode; variant: BadgeVariant }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

// ─── Toggle ──────────────────────────────────────────────────────────────────
export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`toggle ${on ? 'on' : ''}`}
      onClick={onToggle}
      aria-pressed={on}
    />
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}
export function Modal({ open, onClose, title, children, width = 'w-[500px]' }: ModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center animate-[bfadeIn_0.2s_ease]"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`${width} max-w-[95vw] rounded-modal p-8 animate-modal-in`}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
        }}
      >
        <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

// ─── Stat Mini Card ──────────────────────────────────────────────────────────
export function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex-1 rounded-[var(--radius)] p-3.5"
         style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
      <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-display text-[17px] font-bold" style={{ color: color ?? 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
      <span className="text-4xl mb-3 block">{icon}</span>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

// ─── Section Title ───────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[1.5px] px-2 mb-1.5"
       style={{ color: 'var(--text-muted)' }}>
      {children}
    </p>
  )
}
