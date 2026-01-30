import { useBoard } from '../hooks/useBoard'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import Board from './toDo/board'
import Sidebar from './ui/Sidebar'
import { Button } from './ui/button'
import GoogleLogo from '../assets/icons8-google.svg'
import UserModal from './ui/userModal'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Edit } from 'lucide-react'

function AppContent() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth()
  const [openModal, setOpenModal] = useState(false)
  const [editName, setEditName] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')

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
    removeBoard,
    updateName
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

  const handleNewNameEnter = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newBoardName.trim()) {
      e.preventDefault()

      if (newBoardName.trim() === currentBoard?.name) {
        setEditName(false)
        return
      }

      setNewBoardName(newBoardName.trim())
      updateName(currentBoard?.id, newBoardName.trim())
      setEditName(false)
    }
  }
  
  const handleBlur = async () => {
    if (newBoardName.trim() && newBoardName.trim() !== currentBoard?.name) {
      updateName(currentBoard?.id, newBoardName.trim())
    }
    setEditName(false)
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
                  <h1 className="group text-2xl gap-1 flex md:text-3xl font-bold text-blue-800">
                    { editName ? (
                      <input
                        autoFocus
                        type='text'
                        value={newBoardName}
                        onBlur={handleBlur}
                        onKeyDown={handleNewNameEnter}
                        onChange={e => setNewBoardName(e.target.value)}
                        className='h-10 w-[300px] border-0 bg-white text-gray-800'
                      >
                      </input>
                    ) : (
                      <span>
                        {currentBoard.name}
                      </span>
                    )}
                    <Button
                      onClick={() => {
                        setNewBoardName(currentBoard.name)
                        setEditName(true)
                      }}
                      className='opacity-0 -z-10 bg-transparent group-hover:bg-transparent hover:cursor-pointer group-hover:opacity-100 group-hover:z-0 transition-all'
                    >
                      <Edit className='h-4 w-4 text-white'></Edit>
                    </Button>
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
      <Toaster position="bottom-right" />
      <AppContent />
    </AuthProvider>
  )
}