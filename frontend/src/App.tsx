import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import HealthCheck from './components/HealthCheck'
import './App.css'

function App() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Backend Health Check</h2>
          <HealthCheck />
        </div>
        <HomePage />
      </div>
    </MainLayout>
  )
}

export default App

