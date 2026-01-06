import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
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

function SidebarContent() {
  const { user, signInWithGoogle, signOut } = useAuth()
  
  const userName = user?.displayName ? user.displayName.split(' ')[0] : ''

  return (
    <div className="flex h-full justify-between flex-col">
      {/* Header */}
      <div className="">
        {user ? (
            <h1 className="text-xl font-bold">{ userName }</h1>
        ): (
            <h1 className="text-xl font-bold">toDo List</h1>
        )}
    </div>


      {/* Spacer */}
      {/* <div className="flex-1" /> */}

      {/* Usuario */}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-zinc-800 cursor-pointer">
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
      )}
    </div>
  )
}

export default function Sidebar() {
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
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className='fixed-sidebar flex flex-col text-center'>
          <SheetHeader>
            <SheetTitle className='sidebar-title'>MENÚ</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sidebar fijo para desktop */}
      <div className="hidden fixed-sidebar md:block fixed left-0 top-0 h-screen w-64 p-4">
        <SidebarContent />
      </div>
    </>
  )
}