import { useBoard } from '../hooks/useBoard'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import Board from './toDo/board'
import Sidebar from './ui/Sidebar'
import { Button } from './ui/button'
import GoogleLogo from '../assets/icons8-google.svg'
import UserModal from './ui/userModal'
import { useState } from 'react'

function AppContent() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth()
  const [openModal, setOpenModal] = useState(false)

  const {
    boards,
    currentBoard,
    tasks,
    loading: boardLoading,
    addTask,
    updateStatus,
    removeTask,
    addBoard,
    switchBoard,
    removeBoard
  } = useBoard()

  if (authLoading || boardLoading) {
    return (
      <div className="ml-0 md:ml-64 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Sidebar
        boards={boards}
        currentBoard={currentBoard}
        onSelectBoard={switchBoard}
        onCreateBoard={addBoard}
        onDeleteBoard={removeBoard}
        onOpenModal={setOpenModal}
      />
      <div className="ml-0 md:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="container mx-auto max-w-7xl py-8">
          {user ? (
            <>
              {/* header con el nombre del board actual */}
              {currentBoard && (
                <div className="mb-6 px-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-blue-800">
                    {currentBoard.name}
                  </h1>
                  {/* <p className="text-sm text-gray-500 mt-1">
                    {boards.length} {boards.length === 1 ? 'tablero' : 'tableros'} total
                  </p> */}
                </div>
              )}

              <Board
                tasks={tasks}
                loading={boardLoading}
                addTask={addTask}
                updateStatus={updateStatus}
                removeTask={removeTask}
              />
              <UserModal
                open={openModal}
                onOpenChange={setOpenModal}
                currentBoard={currentBoard}
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-6 py-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">📝 My Todo List</h1>
                <p className="text-lg text-gray-600 mb-6">
                  Organiza tus actividades y colabora con otros
                </p>
              </div>
              <Button onClick={signInWithGoogle} size="lg">
                <img src={GoogleLogo.src} alt="Google" className="mr-2 h-4 w-4" />
                Iniciar sesión con Google
              </Button>
            </div>
          )}
        </div>
      </div>
    </>

  )
}

export default function App() {

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}