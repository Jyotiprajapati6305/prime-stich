import './Dashboard.css'

export default function Dashboard() {
  const kpis = [
    { label: 'Revenue', value: '₹0', color: '#7A9E7E' },
    { label: 'Orders', value: '0', color: '#D4A5A5' },
    { label: 'Pending', value: '0', color: '#D4A84B' },
    { label: 'Products', value: '0', color: '#8B7E7E' },
    { label: 'Materials', value: '0', color: '#B8A7A7' },
    { label: 'Profit', value: '₹0', color: '#7A9E7E' },
  ]

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to your crochet studio</p>
      </header>

      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card card">
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="card">
          <h3>Today's Tasks</h3>
          <p className="empty-text">No tasks yet. Orders will appear here.</p>
        </div>
        <div className="card">
          <h3>Recent Orders</h3>
          <p className="empty-text">No recent orders.</p>
        </div>
      </div>

      <div className="quick-actions card">
        <h3>Quick Actions</h3>
        <div className="actions-row">
          <button className="btn btn-primary">+ New Order</button>
          <button className="btn btn-outline">+ Add Product</button>
          <button className="btn btn-outline">+ Add Customer</button>
        </div>
      </div>
    </div>
  )
}
