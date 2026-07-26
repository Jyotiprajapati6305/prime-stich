import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import StatCard from '../components/StatCard.jsx'

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/reports/dashboard').then((res) => setData(res.data))
  }, [])

  if (!data) return <div>Loading your dashboard…</div>

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Welcome back 👋</h1>
          <p>Here's how your crochet business is doing right now.</p>
        </div>
        <Link to="/orders" className="btn btn-primary">+ New Order</Link>
      </div>

      <div className="stat-grid">
        <StatCard label="Active orders" value={data.active_orders} sub={`${data.total_orders} total orders`} />
        <StatCard label="Ready to deliver" value={data.pending_delivery} accent="var(--sage)" />
        <StatCard label="Revenue this month" value={money(data.revenue_this_month)} accent="var(--plum)" />
        <StatCard label="Profit this month" value={money(data.profit_this_month)} sub={`Expenses ${money(data.expenses_this_month)}`} />
        <StatCard label="Unpaid / due" value={money(data.unpaid_amount)} accent="var(--danger)" />
        <StatCard
          label="Low stock materials"
          value={data.low_stock_materials}
          sub={data.low_stock_materials > 0 ? 'Needs restock' : 'All good'}
          accent={data.low_stock_materials > 0 ? 'var(--danger)' : 'var(--sage)'}
        />
      </div>

      <div className="card">
        <div className="section-title">Recent orders</div>
        {data.recent_orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Add your first WhatsApp or Instagram order to see it here.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Status</th><th>Amount</th></tr>
              </thead>
              <tbody>
                {data.recent_orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.order_number}</td>
                    <td>{o.customer_name}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status.replace('_', ' ')}</span></td>
                    <td>{money(o.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
