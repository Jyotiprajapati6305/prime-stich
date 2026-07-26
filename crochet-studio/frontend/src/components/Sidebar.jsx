import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const LINKS = [
  { to: '/', label: 'Dashboard', icon: '◆' },
  { to: '/orders', label: 'Orders', icon: '🧶' },
  { to: '/products', label: 'Products', icon: '🧸' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/materials', label: 'Materials', icon: '🧵' },
  { to: '/expenses', label: 'Expenses', icon: '💰' },
  { to: '/reports', label: 'Reports', icon: '📊' },
  { to: '/notes', label: 'Notes', icon: '📝' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth()
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <span>🧵</span> Stitch Studio
      </div>
      <div className="sidebar-nav">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
            onClick={onNavigate}
          >
            <span>{l.icon}</span> {l.label}
          </NavLink>
        ))}
      </div>
      <div className="sidebar-foot">
        <div className="sidebar-user">Signed in as {user?.display_name || user?.username}</div>
        <button className="btn btn-ghost btn-block" style={{ color: '#f6ecf1' }} onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  )
}
