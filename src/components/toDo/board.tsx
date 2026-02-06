import { useEffect, useState, type ReactEventHandler } from "react"
import { useAuth } from "../auth/AuthProvider"
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import type { Board, Idea, Status } from "../../types/types"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import TaskCard from "./taskCard"
import ColumnGrid from "../ui/columnGrid"
import IdeaInput from "../ui/inputTask"
import { useIsMobile } from "../../layouts/useMediaQuery"
import { useBoard } from "../../hooks/useBoard"
import TaskFormModal, { type TaskFormData } from "../ui/taskFormModal"
// import { updateTask } from "../../lib/firestoreService"


interface BoardProps {
    tasks: Idea[]
    loading: boolean
    currentBoard: Board | null
    addTask: (text: string, description: string | undefined, dueDate: Date | undefined) => Promise<void>
    updateStatus: (taskId: string, newStatus: Status) => Promise<void>
    removeTask: (taskId: string) => Promise<void>
    updateTask: (taskId: string, data: TaskFormData) => Promise<void>
}

//- Arreglo para columnas dinamicas
const COLUMNS: { id: Status; title: string; color: string }[] = [
    { id: 'new', title: 'Ideas', color: 'bg-blue-100 border-blue-200' },
    { id: 'inProgress', title: 'En Proceso', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'paused', title: 'Pausada', color: 'bg-orange-100 border-orange-200' },
    { id: 'finished', title: 'Terminadas', color: 'bg-green-100 border-green-200' },
    { id: 'dropped', title: 'Cancelada', color: 'bg-red-100 border-red-200' },
]


export default function Tablero({
    tasks,
    loading,
    currentBoard,
    addTask,
    updateStatus,
    removeTask,
    updateTask
}: BoardProps) {
    // - Valor del input
    const [inputValue, setInputValue] = useState('')
    // - Revisar el inicio de sesión
    const { user } = useAuth()
    // - Estado de si una tarea está "Drag"
    const [activeId, setActiveId] = useState<string | null>(null)

    // - revisar si es mobile 
    const isMobile = useIsMobile()

    // - Estados para el modal de tareas
    const [taskFormOpen, setTaskFormOpen] = useState(false)
    const [taskInitialText, setTaskInitialText] = useState('')
    const [taskToEdit, setTaskToEdit] = useState<Idea | null>(null)
    const [taskFormMode, setTaskFormMode] = useState<'create' | 'edit'>('create')


    // const { currentBoard } = useBoard()

    // - Método para el enter en el input
    const handleEnter = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault()

            setTaskInitialText(inputValue.trim())
            setTaskFormMode('create')
            setTaskToEdit(null)
            setTaskFormOpen(true)

            setInputValue('')
        }
    }


    // - Función para el submit del Modal
    const handleTaskFormSubmit = async (data: TaskFormData) => {

        if (taskFormMode === 'create') {
            await addTask(data.text, data.description, data.dueDate)
        } else if (taskToEdit && currentBoard) {
            await updateTask(taskToEdit.id, data)
        }
    }

    // Funcion para abrir edición del Task
    const handleOpenEditTask = (task: Idea) => {
        setTaskFormMode('edit')
        setTaskToEdit(task)
        setTaskFormOpen(true)
    }


    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            return
        }

        const taskId = active.id as string
        const newStatus = over.id as Status

        await updateStatus(taskId, newStatus)

        setActiveId(null)
    }

    const handleDragCancel = () => {
        setActiveId(null)
    }

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        await updateStatus(taskId, newStatus as Status)
    }

    const activeTask = tasks.find(idea => idea.id === activeId)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando tablero ...</p>
                </div>
            </div>
        )
    }

    const boardContent = (
        <div className={`board-container p-2 w-full h-full flex flex-col ${user ? '' : 'opacity-30 pointer-events-none select-none'}`}>
            {/* Input para nuevas ideas */}
            <div className="input-form w-full mb-6">
                <h3 className="mb-2 text-lg md:text-xl lg:text-2xl font-semibold">
                    ¿Qué se te ocurre hoy?
                </h3>
                <IdeaInput
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleEnter}
                    disabled={!user}
                />
            </div>

            {/* Grid de columnas */}
            <ColumnGrid
                grid={COLUMNS}
                ideasList={tasks}
                onStatusChange={handleStatusChange}
                onDelete={removeTask}
                onEdit={handleOpenEditTask}
            />

            {/* Modal de crear/editar tarea */}
            <TaskFormModal
                open={taskFormOpen}
                onOpenModal={setTaskFormOpen}
                onSubmit={handleTaskFormSubmit}
                task={taskToEdit}
                initialText={taskInitialText}
                mode={taskFormMode}
            />
        </div>
    )

    // Mobile: Sin drag & drop
    if (isMobile) {
        return <div className="mobile-board w-full px-4">{boardContent}</div>
    }

    // Desktop: Con drag & drop
    return (
        <DndContext
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            {boardContent}

            {/* Overlay para mostrar la tarea mientras se arrastra */}
            <DragOverlay>
                {activeTask ? <TaskCard idea={activeTask} isDragging /> : null}
            </DragOverlay>
        </DndContext>
    )
}

