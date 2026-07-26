import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Orders from './pages/Orders.jsx'
import Products from './pages/Products.jsx'
import Customers from './pages/Customers.jsx'
import Materials from './pages/Materials.jsx'
import Expenses from './pages/Expenses.jsx'
import Reports from './pages/Reports.jsx'
import Notes from './pages/Notes.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="materials" element={<Materials />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notes" element={<Notes />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
