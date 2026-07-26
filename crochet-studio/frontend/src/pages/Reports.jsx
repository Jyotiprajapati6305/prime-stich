import { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../services/api'

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const PIE_COLORS = ['#6B2E4D', '#7C9473', '#D9A544', '#B4483C', '#8E6C88', '#4F7CAC']

export default function Reports() {
  const [revenue, setRevenue] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [expenseBreakdown, setExpenseBreakdown] = useState([])

  useEffect(() => {
    api.get('/reports/revenue-by-month', { params: { months: 6 } }).then((res) => setRevenue(res.data))
    api.get('/reports/top-products', { params: { limit: 6 } }).then((res) => setTopProducts(res.data))
    api.get('/reports/expense-breakdown').then((res) => setExpenseBreakdown(res.data))
  }, [])

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Reports</h1>
          <p>See how your crochet business is trending over time.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Revenue vs. expenses — last 6 months</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7DED2" />
            <XAxis dataKey="month" fontSize={12} stroke="#6B6259" />
            <YAxis fontSize={12} stroke="#6B6259" />
            <Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 10, border: '1px solid #E7DED2' }} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#6B2E4D" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#D9A544" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="section-title">Top-selling items</div>
          {topProducts.length === 0 ? (
            <div className="empty-state">No sales data yet.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Item</th><th>Qty sold</th><th>Revenue</th></tr></thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.item_name}>
                      <td>{p.item_name}</td>
                      <td>{p.quantity}</td>
                      <td>{money(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title">Expense breakdown</div>
          {expenseBreakdown.length === 0 ? (
            <div className="empty-state">No expenses logged yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={85} label={({ category }) => category}>
                  {expenseBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => money(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
