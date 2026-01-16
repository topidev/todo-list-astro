import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { GripVertical, Trash2 } from 'lucide-react'
import type { Idea } from '../../types/types'
import StatusMenu from './statusMenu'

interface TaskCardProps {
  idea: Idea
  isDragging?: boolean
  onStatusChange?: (taskId: string, newStatus: string) => void
  onDelete?: (taskId: string) => void
}

export default function TaskCard({
  idea,
  isDragging = false,
  onStatusChange,
  onDelete
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: idea.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const handleClick = (e: React.MouseEvent) => {
    // Solo en mobile (pantallas menores a 768px)
    if (window.innerWidth < 768) {
      e.stopPropagation()
      setShowMenu(true)
    }
  }

  const handleStatusSelect = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(idea.id, newStatus)
    }
    setShowMenu(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (confirm('¿Eliminar esta tarea?')) {
      onDelete?.(idea.id)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        // {...listeners}
        // {...attributes}
        onClick={handleClick}
        className={`group idea p-3 bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-all  ${isDragging ? 'cursor-grabbing opacity-50 rotate-3 scale-105 shadow-lg' : ''
          }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Drag handle - solo visible en desktop */}
          <button
            {...listeners}
            {...attributes}
            className="hidden md:flex opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-all flex-shrink-0"
            title="Arrastrar"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>

          {/* Texto de la tarea */}
          <p className="text-sm text-gray-600 select-none flex-1">{idea.text}</p>

          {/* Botón de eliminar */}
          <button
            onClick={handleDelete}
            className="opacity-0 relative z-10 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all flex-shrink-0"
            title="Eliminar tarea"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </button>
        </div>

        {/* Indicador visual para mobile */}
        <div className="md:hidden mt-2 flex items-center gap-1 text-xs text-gray-400">
          <span>Toca para mover</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Menú flotante para mobile */}
      {showMenu && (
        <StatusMenu
          currentStatus={idea.status}
          onSelect={handleStatusSelect}
          onClose={() => setShowMenu(false)}
        />
      )}
    </>
  )
}