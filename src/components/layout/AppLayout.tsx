import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import AddTransactionModal from '@/components/layout/AddTransactionModal'

export default function AppLayout() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: '260px 1fr' }}>
      {/* Background glows */}
      <div className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-25"
           style={{
             background: 'radial-gradient(circle,rgba(108,99,255,0.5),transparent 70%)',
             top: -200, right: -100, filter: 'blur(80px)',
           }} />
      <div className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 opacity-25"
           style={{
             background: 'radial-gradient(circle,rgba(0,214,143,0.25),transparent 70%)',
             bottom: 100, left: -100, filter: 'blur(80px)',
           }} />

      <Sidebar />

      <main className="overflow-y-auto relative z-10" style={{ background: 'var(--bg-primary)' }}>
        <Topbar onAddTransaction={() => setModalOpen(true)} />
        <div className="p-8">
          <Outlet context={{ openAddModal: () => setModalOpen(true) }} />
        </div>
      </main>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
