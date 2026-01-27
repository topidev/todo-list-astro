import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./button";
import { AlertCircle, CheckCircle2, Share2, Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { UserData, Board } from "../../types/types";
import { setErrorMap } from "astro:schema";
import { useAuth } from "../auth/AuthProvider";
import { addMemberToBoard, removeMemberFromBoard, getUserByEmail, getUsersByIds } from "../../lib/firestoreService";
import toast from "react-hot-toast";
import MemberItem from "./memberItem";

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


    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
            setUserEmail('')
        }
        else { document.body.style.overflow = 'unset' }

        return () => { document.body.style.overflow = 'unset' }
    }, [open])

    useEffect(() => {
        if (!currentBoard || !open) return

        async function loadMembers() {
            const data = await getUsersByIds(currentBoard.members)
            setMembers(data)
        }

        loadMembers()
    }, [currentBoard, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Limpiar estados previos - ni se usan
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
    const handleChange = (evnt: React.ChangeEvent<HTMLInputElement>) => {
        const email = evnt.target.value
        setUserEmail(email)
    }

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
                        <div className="flex justify-start w-full items-start gap-2">
                            {/* Input de email */}
                            <label className="text-white hidden text-sm sm:text-lg" htmlFor="inputemail">Correo: </label>
                            <input
                                name="email"
                                id="inputemail"
                                type="email"
                                value={userEmail}
                                onChange={handleChange}
                                placeholder="someone@example.com"
                                className=" w-full h-[36px] p-2 rounded border-1 text-white bg-slate-900">

                            </input>
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