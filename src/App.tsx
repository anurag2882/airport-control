import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useAirportStore } from './store/useAirportStore'
import Dashboard from './pages/Dashboard'
import Flights from './pages/Flights'
import Gates from './pages/Gates'
import Baggage from './pages/Baggage'
import Passengers from './pages/Passengers'
import Security from './pages/Security'
import Maintenance from './pages/Maintenance'
import Staff from './pages/Staff'
import Retail from './pages/Retail'

export default function App() {
  const { init, loading, error } = useAirportStore()

  useEffect(() => {
    init()
  }, [init])

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0e17] text-rose-400 text-sm">
        Failed to load dataset: {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0e17] text-slate-400 text-sm">
        Loading airport operations data…
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/gates" element={<Gates />} />
          <Route path="/baggage" element={<Baggage />} />
          <Route path="/passengers" element={<Passengers />} />
          <Route path="/security" element={<Security />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/retail" element={<Retail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
