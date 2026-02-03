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
    subscribeToUserBoards,
    updateBoardName,
    updateBoard,
    updateTask as updateTaskFirestore
} from '../lib/firestoreService'
import type { Board, Idea, Status } from '../types/types'
import { collection, query, where } from 'firebase/firestore'
import toast from 'react-hot-toast'
import type { TaskFormData } from '../components/ui/taskFormModal'

export function useBoard() {
    const { user } = useAuth()
    const [boards, setBoards] = useState<Board[]>([])
    // const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
    const [currentBoardId, setCurrentBoardId] = useState<string | null>(null)
    const [tasks, setTasks] = useState<Idea[]>([])
    const [loading, setLoading] = useState(true)

    const currentBoard = currentBoardId
        ? boards.find(b => b.id === currentBoardId) ?? null
        : null;

    // Cargar boards del usuario
    useEffect(() => {
        if (!user) {
            setBoards([])
            setCurrentBoardId(null)
            setTasks([])
            setLoading(false)
            return
        }
        // Susbribir el usuario a boards
        const unsubscribe = subscribeToUserBoards(user.uid, (userBoards) => {
            setBoards(userBoards)

            console.log('✨ Use Effect UseBoard', currentBoard?.name)

            if (userBoards.length === 0) {
                createDefaultBoard()
                return
            }
            if (!currentBoardId) {
                console.log('Tu?', currentBoard)
                setCurrentBoardId(userBoards[0].id)
            } else {
                const stillExists = userBoards.some(b => b.id === currentBoardId)
                if (!stillExists) {
                    setCurrentBoardId(userBoards[0].id)
                }
            }
            // } else {

            //     if (!stillExists) {
            //         console.log('Tu?')
            //         setCurrentBoard(userBoards[0])
            //     } else {
            //         console.log('Tu?', stillExists.name)
            //         setCurrentBoard(stillExists)
            //     }
            // }


            setLoading(false)
        })

        return () => {
            unsubscribe()
        }

    }, [user, currentBoardId])

    async function createDefaultBoard() {
        if (!user) return

        const boardId = await createBoard(user.uid, 'Mi Tablero', 'blue')
    }

    // Suscribirse a cambios en tiempo real de las tareas
    useEffect(() => {

        console.log('👁‍🗨 Estamos cambiando el tablero')
        console.log('⚠ Este es el Tablero: ', currentBoard?.name)
        if (!currentBoard?.id) {
            setTasks([])
            return
        }

        const unsubscribe = subscribeToTasks(currentBoard.id, (updatedTasks) => {
            setTasks(updatedTasks)
        })

        return () => {
            unsubscribe()
        }
    }, [currentBoard?.id])

    // Agregar tarea
    const addTask = async (text: string, desc?: string, dueDate?: Date) => {
        if (!currentBoard || !user) return

        try {
            await createTask(currentBoard.id, text, user.uid, desc, dueDate)
            // El listener actualizará automáticamente las tareas
        } catch (error) {
            console.error('Error agregando tarea:', error)
        }
    }

    // Agregar updateTask
    const updateTask = async (taskId: string, data: TaskFormData) => {
        if (!currentBoard) return

        try {
            await updateTaskFirestore(currentBoard.id, taskId, {
                text: data.text,
                description: data.description,
                dueDate: data.dueDate,
            })
            toast.success('Tarea actualizada')
        } catch (error) {
            console.error('Error actualizando tarea:', error)
            toast.error('No se pudo actualizar')
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
    const addBoard = async (boarName: string, color: string = 'blue') => {

        if (!user) return

        try {

            const boardId = await createBoard(user.uid, boarName, color)

            const newBoard: Board = {
                id: boardId,
                name: boarName,
                owner: user.uid,
                color: color,
                members: [user.uid],
                createdAt: new Date(),
            }

            setBoards([...boards, newBoard])
            setCurrentBoardId(boardId)

        } catch (error) {
            console.error('Error creando board:', error)
        }
    }

    const updateBoardDetails = async (boardId: string, name: string, color: string) => {
        try {
            setBoards(prev =>
                prev.map(b =>
                    b.id === boardId ? { ...b, name, color } : b
                )
            )

            await updateBoard(boardId, { name, color })
            toast.success('Tablero actualizado')

        } catch (error) {
            console.error('Error actualizando board:', error)
            toast.error('No se pudo actualizar')
        }
        // try {
        //     setBoards(prevBoards =>
        //         prevBoards.map(b =>
        //             b.id === boardId ? { ...b, name, color } : b
        //         )
        //     )

        //     if (currentBoard?.id === boardId) {
        //         setCurrentBoard(prev => prev ? { ...prev, name, color } : null)
        //     }

        //     await updateBoard(boardId, { name, color })
        //     toast.success('Tablero Actualizado')
        //     console.log('💫 Actualizando Tablero:', currentBoard?.name)

        // } catch (error) {
        //     console.error('Error actualizando board:', error)
        //     toast.error('No se pudo actualizar')
        // }
    }

    // Cambiar de board
    const switchBoard = (boardId: string) => {
        // const board = boards.find(b => b.id === boardId)

        // if (board) {
        //     console.log('☢ Switch Board: ', board.name)
        //     setCurrentBoardId(boardId)
        // } else {
        //     console.log('❌ Board no encontrado en la lista')
        // }

        if (boards.some(b => b.id === boardId)) {
            setCurrentBoardId(boardId)
        } else {
            console.warn('Board no encontrado:', boardId)
        }
    }

    // Eliminar board
    const removeBoard = async (boardId: string) => {
        if (!user) return

        try {
            await deleteBoard(boardId, user.uid)

            setBoards(prev => prev.filter(b => b.id !== boardId))

            // Si estamos eliminando el actual → seleccionar otro
            if (currentBoardId === boardId) {
                setCurrentBoardId(boards[0]?.id ?? null)   // el boards ya filtrado no incluye el eliminado
            }
        } catch (error) {
            console.error('Error eliminando board:', error)
            alert(error instanceof Error ? error.message : 'Error eliminando tablero')
        }
        // try {
        //     await deleteBoard(boardId, user.uid)

        //     // Actualizar la lista local
        //     const updatedBoards = boards.filter(b => b.id !== boardId)
        //     setBoards(updatedBoards)

        //     // Si eliminamos el board actual, cambiar a otro
        //     if (currentBoard?.id === boardId && updatedBoards.length > 0) {
        //         setCurrentBoard(updatedBoards[0])
        //     }
        // } catch (error) {
        //     console.error('Error eliminando board:', error)
        //     alert(error instanceof Error ? error.message : 'Error eliminando tablero')
        // }
    }

    //Actualizar nombre del board
    const updateName = async (boardId: string | any, boardName: string) => {
        try {
            await updateBoardName(boardId, boardName)
            toast.success('Nombre actualizado')
        } catch (error) {
            toast.error('No se pudo actualizar el nombre')
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
        removeBoard,
        updateName,
        updateTask,
        updateBoardDetails
    }
}