import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="topbar">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>🧵 Stitch Studio</div>
          <button className="btn btn-ghost" style={{ color: '#fff' }} onClick={() => setMenuOpen(true)}>
            Menu
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-menu">
            <button className="btn btn-ghost" style={{ color: '#fff', marginBottom: 10 }} onClick={() => setMenuOpen(false)}>
              ✕ Close
            </button>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        )}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
