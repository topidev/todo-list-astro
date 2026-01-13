import { useEffect, useState, type ReactEventHandler } from "react"
import { useAuth } from "../auth/AuthProvider"
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import type { Idea, Status } from "../../types/types"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import Column from "./column"
import TaskCard from "./taskCard"
import ColumnGrid from "../ui/columnGrid"
import IdeaInput from "../ui/inputTask"

interface MobileBoardProps {
    user: any;
    inputValue: string;
    setInputValue: (val: string) => void;
    handleEnter: (e: React.KeyboardEvent) => void;
    ideasList: Idea[];
    handleStatusChange: (id: string, status: string) => void;
    activeTask: Idea | undefined;
}

//- Arreglo para tareas dinamicas
const COLUMNS: { id: Status; title: string; color: string }[] = [
    { id: 'new', title: 'Ideas', color: 'bg-blue-100 border-blue-200' },
    { id: 'inProgress', title: 'En Proceso', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'paused', title: 'Pausada', color: 'bg-orange-100 border-orange-200' },
    { id: 'finished', title: 'Terminadas', color: 'bg-green-100 border-green-200' },
    { id: 'dropped', title: 'Abandonada', color: 'bg-red-100 border-red-200' },
]

function MobileBoard({ 
    user, inputValue, setInputValue, handleEnter, ideasList, handleStatusChange, activeTask 
}: MobileBoardProps) {
    return (
        <div
            className="mobile-board w-full px-4"
        >
            <div className={`board-container p-2 w-full h-full flex flex-col ${user ? '' : 'opacity-30 pointer-events-none'}`}>
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
                    ideasList={ideasList}
                    onStatusChange={handleStatusChange}
                />

                {/* Overlay para mostrar la tarea mientras se arrastra */}
                <DragOverlay>
                    {activeTask ? (
                        <TaskCard idea={activeTask} isDragging />
                    ) : null}
                </DragOverlay>
            </div>
        </div>
    )
}

export default function Board() {
    // - Valor del input
    const [inputValue, setInputValue] = useState('')
    // - Lista de Idea (Despues buscar en base de datos)
    const [ideasList, setIdeasList] = useState<Idea[]>([])
    // - Revisar el inicio de sesión
    const { user } = useAuth()
    // - Estado de si una tarea está "Drag"
    const [activeId, setActiveId] = useState<string | null>(null)
    
    // - revisar si es mobile 
    const [isMobile, setIsMobile] = useState(true)

    // - UseEffect para el windows resize
    useEffect(() => {
        function handleResize() {
            console.log(window.innerWidth)
            if (window.innerWidth > 768) {
                console.log("Desktop View")
                setIsMobile(false)
            }
            else {
                setIsMobile(true)
                console.log("MObile View")
            }
        }

        handleResize()

        window.addEventListener("resize", handleResize)

        return () => {  
            window.removeEventListener("resize", handleResize)
        }
        
    }, [])


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

    const handleStatusChange = (taskId: string, newStatus: string) => {
        setIdeasList(prev =>
            prev.map(idea =>
                idea.id === taskId ? { ...idea, status: newStatus as Status } : idea
            )
        )
    }

    const activeTask = ideasList.find(idea => idea.id === activeId)

    return (
        <>
            {
                isMobile ? (
                    <MobileBoard 
                        user={user}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        handleEnter={handleEnter}
                        ideasList={ideasList}
                        handleStatusChange={handleStatusChange}
                        activeTask={activeTask}
                    />
                ): (
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
                                ideasList={ideasList}
                                onStatusChange={handleStatusChange}
                            />

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
        </>
        
    )
}

