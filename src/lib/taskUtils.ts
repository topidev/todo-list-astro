import { Timestamp } from "firebase/firestore";
import type { Idea } from "../types/types"


// calcular días restantes
export function getDaysUntilDue(dueDate?: Date): number | null {
    const due = timeToDate(dueDate)
    if (!due) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)


    due?.setHours(0, 0, 0, 0)

    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
}


// nivel de urgencia
export type UrgencyLevel = 'overdue' | 'urgent' | 'soon' | 'normal' | 'none'

export function getUrgencyLevel(dueDate?: Date): UrgencyLevel {
    const days = getDaysUntilDue(dueDate)

    if (days === null) return 'none'

    if (days < 0) return 'overdue'
    if (days >= 0 && days <= 2) return 'urgent'
    if (days > 2 && days <= 5) return 'soon'

    return 'normal'
}

export interface UngencyStyles {
    ring: string
    bg: string
    text: string
    label: string
}

export function getUrgencyStyle(u: UrgencyLevel): UngencyStyles {
    switch (u) {
        case 'overdue':
            return {
                ring: 'ring-2 ring-red-500',
                bg: 'bg-red-100',
                text: 'text-red-700',
                label: 'Vencida'
            }
        case 'urgent':
            return {
                ring: 'ring-2 ring-orange-400',
                bg: 'bg-orange-100',
                text: 'text-orange-700',
                label: 'Urgente'
            }
        case 'soon':
            return {
                ring: 'ring-2 ring-yellow-400',
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                label: 'Próxima'
            }
        case 'normal':
            return {
                ring: 'ring-1 ring-blue-300',
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                label: 'Planificada'
            }
        case 'none':
        default:
            return {
                ring: '',
                bg: '',
                text: '',
                label: ''
            }
    }
}

export function timeToDate(time: Date | string | Timestamp | undefined): Date | null {
    if (!time) return null

    if (time instanceof Timestamp) {
        return time.toDate()
    } else if (typeof time === 'string') {
        return new Date(time)
    } else return time

}

//ordenar tareas por fecha
export function sortTaskByDate(tasks: Idea[]): Idea[] {


    return [...tasks].sort((a, b) => {
        const aHasDue = !!a.dueDate
        const bHasDue = !!b.dueDate

        if (aHasDue && bHasDue) {
            const aDate = timeToDate(a.dueDate)!
            const bDate = timeToDate(b.dueDate)!
            return aDate.getTime() - bDate.getTime()
        }


        if (aHasDue && !bHasDue) return -1

        if (bHasDue && !aHasDue) return 1

        if (a.createdAt && b.createdAt) {
            const aCreated = timeToDate(a.createdAt)!
            const bCreated = timeToDate(b.createdAt)!

            const aTime = aCreated.getTime()
            const bTime = bCreated.getTime()


            return aTime - bTime
        }

        return 0
    })
}


// formato para la fecha
export function formatDate(dueDate: Date | undefined): string {
    const date = timeToDate(dueDate)
    if (!date) return ''

    const days = getDaysUntilDue(date)

    if (days === null) return ''

    if (days < 0) {
        return `Vencida hace ${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''} `
    }

    if (days === 0) return 'Vence hoy'
    if (days === 1) return 'Vence mañana'
    if (days <= 5) return `Vence en ${days} días`

    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })

}