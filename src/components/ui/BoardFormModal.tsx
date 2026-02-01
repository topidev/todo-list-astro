import { useEffect, useState, type SetStateAction } from "react"
import type { Board } from "../../types/types"
import toast from "react-hot-toast"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@radix-ui/react-dialog"
import { Button } from "./button"
import { Calendar, X } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"


interface BoardFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: BoardFormData) => Promise<void>
    board?: Board | null
    mode: 'create' | 'edit'
}

export interface BoardFormData {
    name: string
    color: string
}

const COLORS = [
    { name: 'Azul', value: 'bg-blue-500' },
    { name: 'Verde', value: 'bg-green-500' },
    { name: 'Rojo', value: 'bg-red-500' },
    { name: 'Amarillo', value: 'bg-yellow-500' },
    { name: 'Morado', value: 'bg-purple-500' },
    { name: 'Rosa', value: 'bg-pink-500' },
    { name: 'Naranja', value: 'bg-orange-500' },
]

export default function BoardFormModal({
    open,
    onOpenChange,
    onSubmit,
    board,
    mode
}: BoardFormModalProps) {
    const [name, setName] = useState('')
    const [selectedColor, setSelectedColor] = useState(COLORS[0].value)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'

            if (mode === 'edit' && board) {
                setName(board.name)
                setSelectedColor(board.color || COLORS[0].value)
            } else {
                setName('')
                setSelectedColor(COLORS[0].value)
            }
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => { document.body.style.overflow = 'unset' }

    }, [open, mode, board])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) return

        setLoading(true)

        try {

            await onSubmit({
                name: name.trim(),
                color: selectedColor,
            })

            onOpenChange(false)

        } catch (err) {
            toast.error('Error en el Formulario')
            console.log('Error en el formulario: ', err)
        } finally {
            setLoading(false)
        }
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <form
                    onSubmit={handleSubmit}
                    className="relative w-full max-w-md bg-slate-700 rounded-lg shadow-xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-600">
                        <DialogTitle className="text-xl font-bold text-white">
                            {mode === 'create' ? 'Crear Tablero' : 'Editar Tablero'}
                        </DialogTitle>
                        <DialogClose asChild>
                            <button
                                type="button"
                                className="p-1 hover:bg-gray-600 rounded transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </DialogClose>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-white">
                                Nombre del tablero *
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Proyecto Final"
                                maxLength={50}
                                required
                                autoFocus
                                className="w-full px-3 py-2 bg-slate-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-400">{name.length}/50 caracteres</p>
                        </div>

                        {/* Color */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white">
                                Color del tablero
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`relative h-12 rounded-lg ${color.value} transition-all ${selectedColor === color.value
                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-700 scale-105'
                                            : 'hover:scale-105'
                                            }`}
                                        title={color.name}
                                    >
                                        {selectedColor === color.value && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-5 h-5 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-600">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading || !name.trim()}>
                            {loading
                                ? 'Guardando...'
                                : mode === 'create'
                                    ? 'Crear tablero'
                                    : 'Guardar cambios'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}