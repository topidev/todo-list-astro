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
  limit,
} from 'firebase/firestore'
import { db } from './firebase'
import type { UserData } from '../types/types'
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
 * Escuchar cambios en tiempo real de los boards de un usuario
 */
export function subscribeToUserBoards(
  userId: string,
  callback: (boards: Board[]) => void
): () => void {
  const boardsRef = collection(db, 'boards')
  const q = query(boardsRef, where('members', 'array-contains', userId))

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const userBoards = snapshot.docs.map(doc => doc.data() as Board)
      callback(userBoards)
    },
    (error) => {
      console.error('Error en listener de boards:', error)
    }
  )

  return unsubscribe
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

/**
 * Eliminar un board y todas sus tareas
 */
export async function deleteBoard(boardId: string, userId: string): Promise<void> {
  const boardRef = doc(db, 'boards', boardId)
  const boardSnap = await getDoc(boardRef)

  if (!boardSnap.exists()) {
    throw new Error('Board no encontrado')
  }

  const board = boardSnap.data() as Board

  // Solo el owner puede eliminar el board
  if (board.owner !== userId) {
    throw new Error('No tienes permisos para eliminar este tablero')
  }

  // Eliminar todas las tareas primero
  const tasksRef = collection(db, 'boards', boardId, 'tasks')
  const tasksSnapshot = await getDocs(tasksRef)

  const deletePromises = tasksSnapshot.docs.map(taskDoc =>
    deleteDoc(doc(db, 'boards', boardId, 'tasks', taskDoc.id))
  )

  await Promise.all(deletePromises)

  // Eliminar el board
  await deleteDoc(boardRef)

  // Remover el board de todos los usuarios miembros
  for (const memberId of board.members) {
    await removeUserBoard(memberId, boardId)
  }
}


/**
 * Quitar un miembro de un board
 */
export async function removeMemberFromBoard(
  boardId: string,
  userId: string
): Promise<void> {
  // 1. Quitar del board.members
  const boardRef = doc(db, 'boards', boardId)
  const boardSnap = await getDoc(boardRef)

  if (!boardSnap.exists()) {
    throw new Error('Board no encontrado')
  }

  const board = boardSnap.data() as Board

  await updateDoc(boardRef, {
    members: board.members.filter(id => id !== userId)
  })

  // 2. Quitar del user.boards
  await removeUserBoard(userId, boardId)
}

/**
 * Remover un board de la lista de un usuario
  */
export async function removeUserBoard(userId: string, boardId: string): Promise<void> {
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const userData = userSnap.data()
    const boards = userData.boards || []

    await updateDoc(userRef, {
      boards: boards.filter((id: string) => id !== boardId),
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

// ==================== USERS ====================

/**
 * Buscar un usuario por su email
 */
export async function getUserByEmail(email: string): Promise<UserData | null> {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email.toLowerCase().trim()))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    // Retornar el primer usuario encontrado
    const userDoc = querySnapshot.docs[0]
    return userDoc.data() as UserData
  } catch (error) {
    console.error('Error buscando usuario por email:', error)
    throw error
  }
}

/**
 * Crear o actualizar el documento del usuario al hacer login
 */
export async function createOrUpdateUser(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<void> {
  const userRef = doc(db, 'users', uid)

  await setDoc(
    userRef,
    {
      uid,
      email: email.toLowerCase(),
      displayName,
      photoURL: photoURL || null,
      updatedAt: serverTimestamp(),
    },
    { merge: true } // merge: true para no sobrescribir el array de boards
  )
}

/**
 * Obtener datos de múltiples usuarios por sus UIDs
 */
export async function getUsersByIds(userIds: string[]): Promise<UserData[]> {
  if (userIds.length === 0) return []

  // Firestore limita a 10 elementos en "in"
  // Si tienes más de 10 miembros, necesitas hacer múltiples queries
  const chunks = []
  for (let i = 0; i < userIds.length; i += 10) {
    chunks.push(userIds.slice(i, i + 10))
  }

  const usersPromises = chunks.map(async (chunk) => {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('uid', 'in', chunk))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data() as UserData)
  })

  const usersArrays = await Promise.all(usersPromises)
  return usersArrays.flat()
}

/**
 * Obtener lista de usuarios (para autocompletar)
 */
export async function getAllUsers(limitCount: number = 50): Promise<UserData[]> {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, limit(limitCount))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data() as UserData)
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return []
  }
}