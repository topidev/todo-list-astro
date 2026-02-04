import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { Calendar, ChevronDown, ChevronUp, Edit2, GripVertical, MoreVertical, Trash2 } from 'lucide-react'
import type { Idea } from '../../types/types'
import StatusMenu from './statusMenu'

interface TaskCardProps {
  idea: Idea
  isDragging?: boolean
  onStatusChange?: (taskId: string, newStatus: string) => void
  onDelete?: (taskId: string) => void
  onEdit?: (task: Idea) => void
}

export default function TaskCard({
  idea,
  isDragging = false,
  onStatusChange,
  onDelete,
  onEdit
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: idea.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevenir expansión si se clickea en botones específicos
    const target = e.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('[data-drag-handle]')
    ) {
      return
    }

    setIsExpanded(!isExpanded)
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
    setShowOptionsMenu(false)

    if (confirm('¿Eliminar esta tarea?')) {
      onDelete?.(idea.id)
    }
  }

  // Formatear fecha
  const formatDate = (date?: Date) => {
    if (!date) return null

    const fecha = date.toDate()
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowOptionsMenu(false)
    onEdit?.(idea)
  }

  const toggleOptionsMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowOptionsMenu(!showOptionsMenu)
  }

  const hasDetails = idea.description || idea.dueDate

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleCardClick}
        className={`group idea p-3 bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-all  
          ${isDragging ? 'cursor-grabbing opacity-50 rotate-3 scale-105 shadow-lg' : ''
          }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Drag handle - solo visible en desktop */}
          <button
            {...listeners}
            {...attributes}
            data-drag-handle
            className="hidden md:flex opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-all flex-shrink-0"
            title="Arrastrar"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>

          {/* Texto de la tarea */}
          <p className="text-sm text-gray-600 select-none flex-1">{idea.text}</p>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Indicador de que tiene detalles */}
            {hasDetails && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mr-1">
                {idea.dueDate && (
                  <Calendar className="h-3 w-3" />
                )}
              </div>
            )}

            {/* Botón de menú de opciones */}
            <div className="relative">
              <button
                onClick={toggleOptionsMenu}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                title="Opciones"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>

              {/* Menú desplegable de opciones */}
              {showOptionsMenu && (
                <>
                  {/* Overlay para cerrar el menú */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowOptionsMenu(false)
                    }}
                  />

                  <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Icono de expansión */}
            {hasDetails && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className="p-1 hover:bg-gray-100 rounded transition-all"
                title={isExpanded ? "Contraer" : "Expandir"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
            )}
          </div>
        </div>
        {/* Contenido expandible */}
        {isExpanded && hasDetails && (
          <div className="px-3 pb-1 pt-3 border-t border-gray-100 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {/* Descripción */}
            {idea.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Descripción:</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {idea.description}
                </p>
              </div>
            )}

            {/* Fecha límite */}
            {idea.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-gray-500">Fecha límite:</p>
                  <p className="text-sm text-gray-700">{formatDate(idea.dueDate)}</p>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Indicador visual para mobile */}
        <div
          className="md:hidden mt-2 flex items-center gap-1 text-xs text-gray-400"
          onClick={handleClick}
        >
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