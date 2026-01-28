import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./button";
import { AlertCircle, CheckCircle2, Share2, Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { UserData, Board } from "../../types/types";
import { setErrorMap } from "astro:schema";
import { useAuth } from "../auth/AuthProvider";
import { addMemberToBoard, removeMemberFromBoard, getUserByEmail, getUsersByIds, getAllUsers } from "../../lib/firestoreService";
import toast from "react-hot-toast";
import MemberItem from "./memberItem";
import { useDebounce } from 'use-debounce'

export default function UserModal({
    open, onOpenChange, currentBoard
}: {
    open: boolean,
    currentBoard: Board
    onOpenChange: (open: boolean) => void
}) {
    const { user } = useAuth()
    const [userEmail, setUserEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState<UserData[]>([])
    const [debounceEmail] = useDebounce(userEmail, 500)
    const [allUsers, setAllUsers] = useState<UserData[]>([])
    const [suggestions, setSuggestions] = useState<UserData[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    // Eliminar scroll al abir el modal y buscar los usuarios
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
            setUserEmail('')
            
            async function loadUsers() {
                const users = await getAllUsers(30)
                setAllUsers(users)
            }
            loadUsers()
        }
        else { document.body.style.overflow = 'unset' }

        return () => { document.body.style.overflow = 'unset' }
    }, [open])

    // filtrar cuando cambie el email
    useEffect(() => {
        if (debounceEmail.length < 2) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        const filtered = allUsers.filter(u => 
            u.email.toLowerCase().includes(debounceEmail.toLocaleLowerCase()) ||
            u.displayName.toLocaleLowerCase().includes(debounceEmail.toLocaleLowerCase())
        ).slice(0, 5)

        setSuggestions(filtered)
        setShowSuggestions(true)

    }, [debounceEmail, allUsers])

    // Buscar miembros del tablero actuarl
    useEffect(() => {
        if (!currentBoard || !open) return

        async function loadMembers() {
            const data = await getUsersByIds(currentBoard.members)
            setMembers(data)
        }

        loadMembers()
    }, [currentBoard, open])

    // handle submit del form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setLoading(false)

        if (!userEmail.trim()) {
            toast.error('Por favor ingresa un email')
            return
        }

        if (!user) {
            toast.error('Debes Iniciar Sesion')
            return
        }

        if (!currentBoard) {
            toast.error('No hay tablero seleccionado')
            return
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(userEmail.trim())) {
            toast.error('Email inválido')
            return
        }

        setLoading(true)
        const loadingToast = toast.loading("Compartiendo...")

        try {

            // buscar el usuario
            const userTarget = await getUserByEmail(userEmail.trim())

            if (!userTarget) {
                toast.error('Usuario no encontrado. Debe estar registrado')
                toast.error('Debe estar registrado')
                return
            }

            if (userTarget.uid === user.uid || currentBoard.members.includes(userTarget.uid)) {
                toast.error('Ya está en el tablero')
                return
            }

            const addMember = await addMemberToBoard(currentBoard.id, userTarget.uid)


            toast.success('¡Usuario agregado!')
            setUserEmail('')

            setTimeout(() => {
                onOpenChange(false)
            }, 2000);

        } catch (err) {

            console.log('Error compartiendo el tablero: ', err)
            toast.error('Error. Intentalo de nuevo')

        } finally {

            setLoading(false)
            toast.dismiss(loadingToast)

        }
    }

    // handle evento onChange de input 
    const handleChange = (evnt: React.ChangeEvent<HTMLInputElement>) => {
        const email = evnt.target.value
        setUserEmail(email)
    }
    
    // handle evento onFocus de input 
    const handleFocus = () => {
        setShowSuggestions(suggestions.length > 0)
    }
    
    // handle evento onBlur de input 
    const handleBlur = () => {
        setTimeout(() => setShowSuggestions(false), 200)
    }

    // handle quitar usuario de tablero
    const handleRemove = async (memberId: string) => {

        if (!memberId || !currentBoard.id) { return }

        if (!confirm('¿Quitar este usuario del tablero?')) return

        try {
            await removeMemberFromBoard(currentBoard.id, memberId)

            const updateMembers = await getUsersByIds(
                currentBoard.members.filter(id => id !== memberId)
            )

            setMembers(updateMembers)

            toast.success('Usuario Eliminado')
        } catch (err) {
            toast.error('No se pudo borrar el usuario')
        }

        if (!currentBoard) { return null }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="user-dialog flex flex-col items-center justify-center text-center top-0 z-10 left-0 absolute p-2 w-full h-full">
                <form onSubmit={handleSubmit} className="w-5/6 sm:max-w-[425px] bg-slate-700 p-5 rounded">
                    <DialogTitle className="text-lg flex justify-between text-left sm:text-xl mb-6 font-bold text-white">
                        Compartir: {currentBoard?.name}
                        <Share2></Share2>
                    </DialogTitle>
                    <div className="flex flex-col justify-start items-center w-full gap-2">
                        <div className="relative flex justify-start w-full items-start gap-2">
                            {/* Input de email */}
                            <label className="text-white hidden text-sm sm:text-lg" htmlFor="inputemail">Correo: </label>
                            <input
                                name="email"
                                id="inputemail"
                                type="email"
                                value={userEmail}
                                onBlur={handleBlur}
                                onFocus={handleFocus}
                                onChange={handleChange}
                                placeholder="someone@example.com"
                                className=" w-full h-[36px] p-2 rounded border-1 text-white bg-slate-900">

                            </input>
                            {showSuggestions && (
                                <div className="absolute top-full w-full mt-1 bg-slate-800 border border-gray-600 rounded shadow-lg max-h-48 overflow-y-auto z-10">
                                    {suggestions.map(user => (
                                        <Button
                                            key={user.uid}
                                            onClick={() => {
                                                setUserEmail(user.email)
                                                setShowSuggestions(false)
                                            }}
                                            className="w-full p-2 hover:bg-slate-700 text-left flex items-center gap-2"
                                        >
                                            <div>
                                                <p className="text-sm text-white">{user.displayName}</p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="members-list bg-slate-800 p-4 rounded w-full my-4">
                            <h3 className="text-white my-4 font-bold">Miembros actuales:</h3>
                            {members.map(member => (
                                <MemberItem
                                    member={member}
                                    isOwner={user?.uid === currentBoard.owner}
                                    canRemove={currentBoard.owner !== member.uid}
                                    key={member.uid}
                                    onRemove={handleRemove}
                                >

                                </MemberItem>
                            ))}
                        </div>
                    </div>
                    <footer className="flex mt-3 justify-between">
                        <DialogClose asChild>
                            <Button variant={"outline"}> Cancel </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Buscando...' : 'Compartir'}
                        </Button>
                    </footer>

                </form>
            </DialogContent>
        </Dialog >
    )
}