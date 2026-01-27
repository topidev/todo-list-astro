import { useEffect, useState } from 'react'
import { Check, Menu, Plus, Share, Share2, Trash2, User, X } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { Button } from './button'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import GoogleLogo from '../../assets/icons8-google.svg'


interface SideBarProps {
  boards: Array<{ id: string; name: string; owner: string }>
  currentBoard: { id: string; name: string; owner: string } | null
  onSelectBoard: (boardId: string) => void
  onCreateBoard: (name: string) => void
  onDeleteBoard?: (boardId: string) => void
  onOpenModal: (open: boolean) => void
  setOpenSheet?: (open: boolean) => void
}


function SidebarContent({
  boards,
  currentBoard,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onOpenModal,
  setOpenSheet
}: SideBarProps) {

  const { user, signInWithGoogle, signOut } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')

  const userName = user?.displayName ? user.displayName.split(' ')[0] : ''

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName.trim())
      setNewBoardName('')
      setIsCreating(false)
    }
  }

  const handleOpenShareModal = () => {
    onOpenModal(true)
    console.log("abriendo modal")
    if (setOpenSheet) {
      console.log("cerrando sideBar")
      setOpenSheet(false)
    }
  }

  const handleDeleteBoard = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (boards.length === 1) {
      alert('No puedes eliminar tu unico tablero')
      return
    }
    if (confirm('¿Estás seguro de eliminar este tablero? Esta acción no se puede deshacer.')) {
      onDeleteBoard?.(boardId)
    }

  }


  return (
    <div className="flex h-full justify-between flex-col">
      {/* Header */}
      <div className=" my-4">
        <h2 className='text-xl font-bold'> To-Do List </h2>
      </div>


      {/* Sección de Boards */}
      {user && (
        <div className="flex-1 overflow-auto mb-4">
          <div className="flex items-center mt-4 justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase">
              Tableros
            </h2>
            <button
              onClick={() => setIsCreating(true)}
              className=""
              title='Crear nuevo tablero'
            >
              <Plus className='h-5 w-5 rounded transition-colors text-white hover:bg-gray-200 hover:text-gray-700' />
            </button>
          </div>

          {/* Crear Formulario del Tablero */}
          {isCreating && (
            <div className="mb-2 p-2 bg-white border rounded-lg">
              <input
                autoFocus
                type="text"
                value={newBoardName}
                placeholder='Nombre del Tablero'
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                className="w-full px-2 py-1 text-gray-700 text-sm border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-1">
                <button
                  className="flex-1 flex text-white items-center justify-center gap-1 px-2 py-1 bg-blue-500 text white rounded text-sm hover:bg-blue-600 transition-colors"
                  onClick={() => handleCreateBoard()}
                >
                  Crear
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewBoardName('')
                  }}
                  className="flex-1 flex text-gray-800 items-center justify-center gap-1 px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* lista de tableros */}
          <div className="space-y-1">
            {boards.map(board => (
              <div
                key={board.id}
                className={`group flex itemes-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${currentBoard?.id === board.id ?
                  'bg-blue-100 border border-blue-300' :
                  'hover:bg-gray-100 bg-gray-300 border-gray-600'
                  }`}
                onClick={() => {
                  onSelectBoard(board.id)
                }}
              >
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm text-gray-700 font-medium truncate">{board.name}</p>
                  {board.owner === user?.uid && (
                    <p className="text-sm text-gray-500">Propiertario</p>
                  )}
                </div>

                {board.owner === user.uid && board.id === currentBoard?.id && (
                  <button
                    title='Compartir tablero'
                    onClick={handleOpenShareModal}
                    className='opacity-0 group-hover:opacity-100 p-1 transition-all'
                  >
                    <Share2 className='h-4 w-4 text-blue-600' />
                  </button>
                )}
                {board.owner === user?.uid && boards.length > 1 && board.id === currentBoard?.id && (
                  <button
                    onClick={(e) => handleDeleteBoard(board.id, e)}
                    title='Eliminar Tablero'
                    className="opacity-0 group-hover:opacity-100 p-1 transition-all">
                    <Trash2 className='h-4 w-4 text-red-500' />
                  </button>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 hidden md:block"></div>

      {/* Usuario */}
      {
        user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full border border-gray-600 items-center gap-3 rounded-md p-2 hover:bg-zinc-800 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.displayName}</p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='floating-menu'>
              <DropdownMenuItem onClick={signOut} className="text-red-500 ">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={signInWithGoogle} className="w-full">
            <img src={GoogleLogo.src} alt="Google" className="mr-2 h-4 w-4" />
            Iniciar sesión
          </Button>
        )
      }
    </div >
  )
}

export default function Sidebar(props: SideBarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger button - solo visible en mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed-menu fixed top-4 left-4 z-20 md:hidden"
          >
            <Menu className="h-4 text-white w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className='fixed-sidebar flex flex-col text-center'>
          <SheetHeader>
            <SheetTitle className='sidebar-title'>MENÚ</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-full">
            <SidebarContent {...props} setOpenSheet={setOpen} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sidebar fijo para desktop */}
      <div className="hidden fixed-sidebar md:block fixed left-0 top-0 h-screen w-64 p-4">
        <SidebarContent {...props} />
      </div>
    </>
  )
}