import { useState, type ReactEventHandler } from "react"
import { useAuth } from "../auth/AuthProvider"
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import type { Idea, Status } from "../../types/types"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import Column from "./column"
import TaskCard from "./taskCard"


export default function Board() {
    // - Valor del input
    const [inputValue, setInputValue] = useState('')
    // - Lista de Idea (Despues buscar en base de datos)
    const [ideasList, setIdeasList] = useState<Idea[]>([])
    // - Revisar el inicio de sesión
    const { user } = useAuth()
    // - Estado de si una tarea está "Drag"
    const [activeId, setActiveId] = useState<string | null>(null)
    //- Arreglo para tareas dinamicas
    const COLUMNS: { id: Status; title: string; color: string }[] = [
        { id: 'new', title: 'Ideas', color: 'bg-blue-100 border-blue-200' },
        { id: 'inProgress', title: 'En Proceso', color: 'bg-yellow-100 border-yellow-200' },
        { id: 'paused', title: 'Pausada', color: 'bg-orange-100 border-orange-200' },
        { id: 'finished', title: 'Terminadas', color: 'bg-green-100 border-green-200' },
        { id: 'dropped', title: 'Abandonada', color: 'bg-red-100 border-red-200' },
    ]


    // - Método para el enter en el input
    const handleEnter = (e : React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault() 
            console.log("Nueva Idea: " + inputValue)

            const newIdea: Idea = {
                id: crypto.randomUUID(), // Genera un ID único
                text: inputValue.trim(),
                status: 'new' 
            };

            setIdeasList([...ideasList, newIdea])
            setInputValue('')
        }
    }

    // Filtrar ideas por status
    const getIdeasByStatus = (status: Status) => {
        return ideasList.filter(idea => idea.status === status)
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        
        if (!over) {
            setActiveId(null)
            return
        }

        const taskId = active.id as string
        const newStatus = over.id as Status

        // Actualizar el status de la tarea
        setIdeasList(prev =>
            prev.map(idea =>
                idea.id === taskId ? { ...idea, status: newStatus } : idea
            )
        )

        setActiveId(null)
    }

    const handleDragCancel = () => {
        setActiveId(null)
    }

    const activeTask = ideasList.find(idea => idea.id === activeId)

    return (
        <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        >
            <div className={`board-container p-2 w-full h-full flex flex-col ${user ? '' : 'opacity-30 pointer-events-none'}`}>
                {/* Input para nuevas ideas */}
                <div className="input-form w-full mb-6">
                <h3 className="mb-2 text-lg md:text-xl lg:text-2xl font-semibold">
                    ¿Qué se te ocurre hoy?
                </h3>
                <input
                    type="text"
                    id="ideasInput"
                    name="ideasInput"
                    value={inputValue}
                    onKeyDown={handleEnter}
                    placeholder="Escribe una idea y presiona Enter..."
                    className="w-full text-gray-600 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                    onChange={e => setInputValue(e.target.value)}
                    disabled={!user}
                />
                </div>

                {/* Grid de columnas */}
                <main className="container-list w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {COLUMNS.map(column => (
                        <Column
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        color={column.color}
                        ideas={getIdeasByStatus(column.id)}
                        />
                    ))}
                </main>

                {/* Overlay para mostrar la tarea mientras se arrastra */}
                <DragOverlay>
                    {activeTask ? (
                        <TaskCard idea={activeTask} isDragging />
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    )
}

