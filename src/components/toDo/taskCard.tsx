import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Idea } from '../../types/types'

interface TaskCardProps {
  idea: Idea
  isDragging?: boolean
}

export default function TaskCard({ idea, isDragging = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: idea.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`idea p-3 bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 rotate-3 scale-105 shadow-lg' : ''
      }`}
    >
      <p className="text-gray-500 text-sm select-none">{idea.text}</p>
    </div>
  )
}