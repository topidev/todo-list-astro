import { useEffect, useState, type SetStateAction } from "react"
import type { Idea } from "../../types/types"
import toast from "react-hot-toast"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@radix-ui/react-dialog"
import { X, Calendar } from "lucide-react"
import DatePicker from "react-datepicker"
import { Button } from "./button"


interface TaskFormProps {
    open: boolean
    initialText: string
    task?: Idea | null
    mode: 'create' | 'edit'
    onOpenModal: (open: boolean) => void
    onSubmit: (data: TaskFormData) => Promise<void>
}

export interface TaskFormData {
    text: string
    description?: string
    dueDate?: Date
}

export default function TaskFormModal({
    open,
    initialText,
    task,
    mode,
    onOpenModal,
    onSubmit
}: TaskFormProps) {
    const [text, setText] = useState('')
    const [desc, setDesc] = useState('')
    const [date, setDate] = useState<Date | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'

            if (mode === 'edit' && task) {
                setText(task.text)
                setDate(task.dueDate || null)
                setDesc(task.description || '')
            } else {
                setDesc('')
                setDate(null)
                setText(initialText)
            }
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => { document.body.style.overflow = 'unset' }

    }, [open, mode, task, initialText])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!text.trim()) {
            toast('No tiene nombre', {
                icon: '⚠'
            })
            return
        }

        setLoading(true)

        try {
            await onSubmit({
                text: text.trim(),
                description: desc.trim(),
                dueDate: date || undefined
            })
            toast.success('Success')

        } catch (error) {
            console.log('Error en el formulario tarea')
            toast.error('Error en el formulario tarea')
        }
        finally {
            setLoading(false)
            onOpenModal(false)
        }
    }
    return (
        <Dialog open={open} onOpenChange={onOpenModal}>
            <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <form
                    onSubmit={handleSubmit}
                    className="relative w-full max-w-lg bg-slate-700 rounded-lg shadow-xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-600">
                        <DialogTitle className="text-xl font-bold text-white">
                            {mode === 'create' ? 'Nueva Tarea' : 'Editar Tarea'}
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
                    <div className="p-6 space-y-4">
                        {/* Nombre de tarea */}
                        <div className="space-y-2">
                            <label htmlFor="text" className="text-sm font-medium text-white">
                                ¿Qué necesitas hacer? *
                            </label>
                            <input
                                id="text"
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Ej: Terminar el informe"
                                maxLength={100}
                                required
                                autoFocus={mode === 'edit'}
                                className="w-full px-3 py-2 bg-slate-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-400">{text.length}/100 caracteres</p>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-white">
                                Descripción (opcional)
                            </label>
                            <textarea
                                id="description"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Agrega más detalles sobre esta tarea..."
                                rows={4}
                                maxLength={500}
                                className="w-full px-3 py-2 bg-slate-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <p className="text-xs text-gray-400">{desc.length}/500 caracteres</p>
                        </div>

                        {/* Fecha límite */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">
                                Fecha límite (opcional)
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={date}
                                    onChange={(dueDate: SetStateAction<Date | null>) => setDate(dueDate)}
                                    minDate={new Date()}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Selecciona una fecha"
                                    className="w-full px-3 py-2 pl-10 bg-slate-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    wrapperClassName="w-full"
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                            {date && (
                                <button
                                    type="button"
                                    onClick={() => setDate(null)}
                                    className="text-xs text-red-400 hover:text-red-300"
                                >
                                    Limpiar fecha
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-600">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading || !text.trim()}>
                            {loading
                                ? 'Guardando...'
                                : mode === 'create'
                                    ? 'Crear tarea'
                                    : 'Guardar cambios'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}