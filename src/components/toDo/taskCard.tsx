import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Idea } from '../../types/types'
import { useState } from 'react'
import StatusMenu from './statusMenu'

interface TaskCardProps {
  idea: Idea
  isDragging?: boolean
  onStatusChange?: (taskId: string, newStatus: string) => void
}

export default function TaskCard({ idea, isDragging = false, onStatusChange }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: idea.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const handleClick = (e: React.MouseEvent) => {
    // Solo en mobile (pantallas menores a 768px)
    console.log("HandleClick")
    if (window.innerWidth < 768) {
      e.stopPropagation()
      setShowMenu(true)
      console.log("Vista Mobile Menú")
    }
  }

  const handleStatusSelect = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(idea.id, newStatus)
    }
    setShowMenu(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        className={`idea p-3 bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer md:cursor-grab md:active:cursor-grabbing ${
          isDragging ? 'opacity-50 rotate-3 scale-105 shadow-lg' : ''
        }`}
      >
        <p className="text-sm text-gray-500 select-none">{idea.text}</p>
        
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