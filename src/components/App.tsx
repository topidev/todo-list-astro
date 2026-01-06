import { AuthProvider, useAuth } from './auth/AuthProvider'
import Board from './toDo/board'
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
        <div className="text-center mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-extrabold mb-2 text-blue-600">📝 My ToDo List</h1>
          <p className="text-md md:text-lg ">Organiza tus actividades</p>
        </div>

        {user ? (
          <div>
            <Board />
            {/* Aquí irá el tablero de tareas */}
            {/* <p className="text-center text-gray-500">
              El tablero de tareas aparecerá aquí...
            </p> */}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 py-4 md:py-10">
            <p className="text-lg md:text-2xl text-center ">
              Inicia sesión para comenzar a organizar tus tareas
            </p>
            <Board/>
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