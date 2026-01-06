import { AuthProvider, useAuth } from './auth/AuthProvider'
import Sidebar from './ui/Sidebar'
import { Button } from './ui/button'

function AppContent() {
  const { user, loading, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="ml-0 md:ml-64 p-8">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="ml-0 md:ml-64 min-h-screen pt-16 md:pt-0">
      <div className="container mx-auto max-w-7xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-2 text-blue-600">📝 My ToDo List</h1>
          <p className="text-lg text-gray-500">Organiza tus actividades</p>
        </div>

        {user ? (
          <div>
            {/* Aquí irá el tablero de tareas */}
            <p className="text-center text-gray-500">
              El tablero de tareas aparecerá aquí...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 py-12">
            <p className="text-lg text-gray-500">
              Inicia sesión para comenzar a organizar tus tareas
            </p>
            
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Sidebar />
      <AppContent />
    </AuthProvider>
  )
}