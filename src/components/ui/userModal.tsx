import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./button";
import { AlertCircle, CheckCircle2, Share2, Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Board } from "../../types/types";
import { setErrorMap } from "astro:schema";
import { useAuth } from "../auth/AuthProvider";
import { addMemberToBoard, getUserByEmail } from "../../lib/firestoreService";



export default function UserModal({
    open, onOpenChange, currentBoard
}: {
    open: boolean,
    currentBoard: Board | null,
    onOpenChange: (open: boolean) => void
}) {
    const { user } = useAuth()
    const [userEmail, setUserEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // const debounceEmail= useCallback(
    //     debounce( async (email) => {
    //         await
    //     })
    // )
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
            setError('')
            setUserEmail('')
            setLoading(false)
        }
        else { document.body.style.overflow = 'unset' }

        return () => { document.body.style.overflow = 'unset' }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Limpiar estados previos - ni se usan
        setError('')
        setSuccess(false)

        if (!userEmail.trim()) {
            setError('Por favor ingresa un email')
            return
        }

        if (!user) {
            setError('Debes Iniciar Sesion')
            return
        }

        if (!currentBoard) {
            setError('No hay tablero seleccionado')
            return
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(userEmail.trim())) {
            setError('Email inválido')
            return
        }

        setLoading(true)

        try {

            // buscar el usuario
            const userTarget = await getUserByEmail(userEmail.trim())

            if (!userTarget) {
                setError('Usuario no encontrado. Debe estar registrado')
                setLoading(false)
                return
            }

            if (userTarget.uid === user.uid || currentBoard.members.includes(userTarget.uid)) {
                setError('Ya está en el tablero')
                setLoading(false)
                return
            }

            await addMemberToBoard(currentBoard.id, userTarget.uid)

            setSuccess(true)
            setUserEmail('')

            setTimeout(() => {
                setSuccess(false)
                onOpenChange(false)
            }, 2000);
        } catch (err) {
            console.log('Error compartiendo el tablero: ', err)
            setError('Error. Intentalo de nuevo')
        } finally {
            setLoading(false)
            setSuccess(false)
        }
    }
    const handleChange = (evnt: React.ChangeEvent<HTMLInputElement>) => {
        const email = evnt.target.value
        setUserEmail(email)
    }

    if (!currentBoard) { return null }


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

                        <div className="members-list bg-white p-4 rounded w-full my-4">
                            <h3 className="text-inherit">Miembros actuales:</h3>
                            {currentBoard?.members.map(memberId => (
                                <h4 key={memberId} className="text-gray-600"> {memberId} </h4>
                            ))}
                        </div>
                    </div>
                    <footer className="flex mt-3 justify-between">
                        <DialogClose asChild>
                            <Button variant={"outline"}> Cancel </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={loading || success}
                        >
                            {loading ? 'Buscando...' : success ? '¡Listo!' : 'Compartir'}
                        </Button>
                    </footer>
                    {error && (
                        <div className="mt-4 flex items-center gap-2 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 flex items-center gap-2 p-3 bg-green-900/50 border border-green-500 rounded text-green-200 text-sm">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span>¡Usuario agregado exitosamente!</span>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}