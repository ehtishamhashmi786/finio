export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5"
         style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center gap-3 font-display text-3xl font-extrabold animate-fade-up"
           style={{ color: 'var(--text-primary)' }}>
        <div className="w-11 h-11 rounded-[13px] flex items-center justify-center text-xl shadow-glow"
             style={{ background: 'linear-gradient(135deg,#6c63ff,#ff6ec7)' }}>
          💰
        </div>
        Finio
      </div>
      <div className="w-48 h-[3px] rounded-full overflow-hidden"
           style={{ background: 'rgba(128,128,128,0.15)' }}>
        <div className="h-full rounded-full animate-[loadBar_1.2s_ease_forwards]"
             style={{ background: 'linear-gradient(90deg,#6c63ff,#00c9b1)' }} />
      </div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading your finances…</p>
    </div>
  )
}
