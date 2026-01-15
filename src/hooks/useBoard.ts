import { useState, useEffect } from 'react'
import { useAuth } from '../components/auth/AuthProvider'
import {
    createBoard,
    getUserBoards,
    createTask,
    updateTaskStatus,
    deleteTask,
    deleteBoard,
    subscribeToTasks,
} from '../lib/firestoreService'
import type { Board, Idea, Status } from '../types/types'

export function useBoard() {
    const { user } = useAuth()
    const [boards, setBoards] = useState<Board[]>([])
    const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
    const [tasks, setTasks] = useState<Idea[]>([])
    const [loading, setLoading] = useState(true)

    // Cargar boards del usuario
    useEffect(() => {
        if (!user) {
            setBoards([])
            setCurrentBoard(null)
            setTasks([])
            setLoading(false)
            return
        }

        async function loadBoards() {
            try {
                const userBoards = await getUserBoards(user.uid)
                setBoards(userBoards)

                // Si hay boards, seleccionar el primero por defecto
                if (userBoards.length > 0) {
                    setCurrentBoard(userBoards[0])
                } else {
                    // Si no hay boards, crear uno por defecto
                    const boardId = await createBoard(user.uid, 'Mi Tablero')
                    const newBoard: Board = {
                        id: boardId,
                        name: 'Mi Tablero',
                        owner: user.uid,
                        members: [user.uid],
                        createdAt: new Date(),
                    }
                    setBoards([newBoard])
                    setCurrentBoard(newBoard)
                }
            } catch (error) {
                console.error('Error cargando boards:', error)
            } finally {
                setLoading(false)
            }
        }

        loadBoards()
    }, [user])

    // Suscribirse a cambios en tiempo real de las tareas
    useEffect(() => {
        if (!currentBoard) {
            setTasks([])
            return
        }


        const unsubscribe = subscribeToTasks(currentBoard.id, (updatedTasks) => {
            setTasks(updatedTasks)
        })

        return () => {
            unsubscribe()
        }
    }, [currentBoard])

    // Agregar tarea
    const addTask = async (text: string) => {
        if (!currentBoard || !user) return

        try {
            await createTask(currentBoard.id, text, user.uid)
            // El listener actualizará automáticamente las tareas
        } catch (error) {
            console.error('Error agregando tarea:', error)
        }
    }

    // Actualizar status de tarea
    const updateStatus = async (taskId: string, newStatus: Status) => {
        if (!currentBoard) return

        try {
            await updateTaskStatus(currentBoard.id, taskId, newStatus)
            // El listener actualizará automáticamente las tareas
        } catch (error) {
            console.error('Error actualizando tarea:', error)
        }
    }

    // Eliminar tarea
    const removeTask = async (taskId: string) => {
        if (!currentBoard) return

        try {
            await deleteTask(currentBoard.id, taskId)
            // El listener actualizará automáticamente las tareas
        } catch (error) {
            console.error('Error eliminando tarea:', error)
        }
    }

    // Crear nuevo board
    const addBoard = async (boardName: string) => {
        if (!user) return

        try {
            const boardId = await createBoard(user.uid, boardName)
            const newBoard: Board = {
                id: boardId,
                name: boardName,
                owner: user.uid,
                members: [user.uid],
                createdAt: new Date(),
            }
            setBoards([...boards, newBoard])
            setCurrentBoard(newBoard)
        } catch (error) {
            console.error('Error creando board:', error)
        }
    }

    // Cambiar de board
    const switchBoard = (boardId: string) => {
        const board = boards.find(b => b.id === boardId)
        if (board) {
            setCurrentBoard(board)
        }
    }

    // Eliminar board
    const removeBoard = async (boardId: string) => {
        if (!user) return

        try {
            await deleteBoard(boardId, user.uid)

            // Actualizar la lista local
            const updatedBoards = boards.filter(b => b.id !== boardId)
            setBoards(updatedBoards)

            // Si eliminamos el board actual, cambiar a otro
            if (currentBoard?.id === boardId && updatedBoards.length > 0) {
                setCurrentBoard(updatedBoards[0])
            }
        } catch (error) {
            console.error('Error eliminando board:', error)
            alert(error instanceof Error ? error.message : 'Error eliminando tablero')
        }
    }

    return {
        boards,
        currentBoard,
        tasks,
        loading,
        addTask,
        updateStatus,
        removeTask,
        addBoard,
        switchBoard,
        removeBoard
    }
}