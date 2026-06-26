import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { DataProvider } from './context/DataContext'
import ErrorBoundary from './components/ErrorBoundary'
import PasswordGate from './components/PasswordGate'
import Layout from './components/Layout'
import Home from './pages/Home'
import TradeLog from './pages/TradeLog'
import Calendar from './pages/Calendar'
import Journal from './pages/Journal'
import Analytics from './pages/Analytics'
import Accounts from './pages/Accounts'
import Checklist from './pages/Checklist'

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <PasswordGate>
          <DataProvider>
            <HashRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="trades" element={<TradeLog />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="journal" element={<Journal />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="accounts" element={<Accounts />} />
                  <Route path="checklist" element={<Checklist />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </HashRouter>
          </DataProvider>
        </PasswordGate>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
