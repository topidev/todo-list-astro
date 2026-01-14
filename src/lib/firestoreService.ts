import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Idea, Board, Status } from '../types/types'

// ==================== BOARDS ====================

/**
 * Crear un nuevo board
 */
export async function createBoard(userId: string, boardName: string): Promise<string> {
  const boardRef = doc(collection(db, 'boards'))
  const boardId = boardRef.id

  await setDoc(boardRef, {
    id: boardId,
    name: boardName,
    owner: userId,
    members: [userId], // El creador es el primer miembro
    createdAt: serverTimestamp(),
  })

  // Agregar el board al usuario
  await updateUserBoards(userId, boardId)

  return boardId
}

/**
 * Obtener un board por ID
 */
export async function getBoard(boardId: string): Promise<Board | null> {
  const boardRef = doc(db, 'boards', boardId)
  const boardSnap = await getDoc(boardRef)

  if (!boardSnap.exists()) return null

  return boardSnap.data() as Board
}

/**
 * Obtener todos los boards de un usuario
 */
export async function getUserBoards(userId: string): Promise<Board[]> {
  const boardsRef = collection(db, 'boards')
  const q = query(boardsRef, where('members', 'array-contains', userId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(doc => doc.data() as Board)
}

/**
 * Agregar un miembro a un board
 */
export async function addMemberToBoard(boardId: string, userId: string): Promise<void> {
  const boardRef = doc(db, 'boards', boardId)
  const boardSnap = await getDoc(boardRef)

  if (!boardSnap.exists()) {
    throw new Error('Board no encontrado')
  }

  const board = boardSnap.data() as Board
  
  if (!board.members.includes(userId)) {
    await updateDoc(boardRef, {
      members: [...board.members, userId],
    })

    // Agregar el board al usuario
    await updateUserBoards(userId, boardId)
  }
}

/**
 * Actualizar la lista de boards de un usuario
 */
async function updateUserBoards(userId: string, boardId: string): Promise<void> {
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const userData = userSnap.data()
    const boards = userData.boards || []
    
    if (!boards.includes(boardId)) {
      await updateDoc(userRef, {
        boards: [...boards, boardId],
      })
    }
  } else {
    // Crear el documento del usuario si no existe
    await setDoc(userRef, {
      boards: [boardId],
    })
  }
}

// ==================== TASKS ====================

/**
 * Crear una nueva tarea
 */
export async function createTask(
  boardId: string,
  text: string,
  userId: string
): Promise<string> {
  const taskRef = doc(collection(db, 'boards', boardId, 'tasks'))
  const taskId = taskRef.id

  await setDoc(taskRef, {
    id: taskId,
    text,
    status: 'new',
    createdAt: serverTimestamp(),
    createdBy: userId,
  })

  return taskId
}

/**
 * Obtener todas las tareas de un board
 */
export async function getTasks(boardId: string): Promise<Idea[]> {
  const tasksRef = collection(db, 'boards', boardId, 'tasks')
  const querySnapshot = await getDocs(tasksRef)

  return querySnapshot.docs.map(doc => doc.data() as Idea)
}

/**
 * Actualizar el status de una tarea
 */
export async function updateTaskStatus(
  boardId: string,
  taskId: string,
  newStatus: Status
): Promise<void> {
  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId)
  await updateDoc(taskRef, {
    status: newStatus,
  })
}

/**
 * Eliminar una tarea
 */
export async function deleteTask(boardId: string, taskId: string): Promise<void> {
  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId)
  await deleteDoc(taskRef)
}

/**
 * Escuchar cambios en tiempo real de las tareas
 */
export function subscribeToTasks(
  boardId: string,
  callback: (tasks: Idea[]) => void
): () => void {
  const tasksRef = collection(db, 'boards', boardId, 'tasks')

  const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
    const tasks = snapshot.docs.map(doc => doc.data() as Idea)
    callback(tasks)
  })

  return unsubscribe
}