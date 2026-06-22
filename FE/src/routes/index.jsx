import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '../pages/public/HomePage'
import BuyPage from '../pages/public/BuyPage'

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/buy" element={<BuyPage />} />
    <Route path="/rent" element={<Navigate to="/buy?purpose=rent" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default AppRoutes
