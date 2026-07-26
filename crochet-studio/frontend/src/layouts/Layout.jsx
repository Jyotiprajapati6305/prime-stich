import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  FiHome, FiShoppingBag, FiBox, FiUsers, FiLayers, 
  FiDollarSign, FiBarChart2, FiFileText, FiSettings, FiLogOut, FiMenu, FiX 
} from 'react-icons/fi'
import { useState } from 'react'
import './Layout.css'

const navItems = [
  { path: '/', label: 'Dashboard', icon: FiHome },
  { path: '/orders', label: 'Orders', icon: FiShoppingBag },
  { path: '/products', label: 'Products', icon: FiBox },
  { path: '/customers', label: 'Customers', icon: FiUsers },
  { path: '/materials', label: 'Materials', icon: FiLayers },
  { path: '/expenses', label: 'Expenses', icon: FiDollarSign },
  { path: '/reports', label: 'Reports', icon: FiBarChart2 },
  { path: '/notes', label: 'Notes', icon: FiFileText },
  { path: '/settings', label: 'Settings', icon: FiSettings },
]

export default function Layout({ setIsAuthenticated }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <div className="layout">
      {/* Mobile header */}
      <header className="mobile-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
          <FiMenu size={24} />
        </button>
        <h1 className="logo">Prime Stich</h1>
      </header>

      {/* Overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="logo">🧶 Prime Stich</h1>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <FiX size={22} />
          </button>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
