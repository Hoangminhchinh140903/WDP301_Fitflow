import AppRoutes from './routes'
import { BuyCartProvider } from './contexts/BuyCartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { RentalCartProvider } from './contexts/RentalCartContext'

function App() {
  return (
    <RentalCartProvider>
      <BuyCartProvider>
        <FavoritesProvider>
          <AppRoutes />
        </FavoritesProvider>
      </BuyCartProvider>
    </RentalCartProvider>
  )
}

export default App
