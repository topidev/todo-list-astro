import { useDroppable } from '@dnd-kit/core'
import type { Idea } from '../../types/types'
import TaskCard from './taskCard'
import { useIsMobile } from '../../layouts/useMediaQuery'

interface ColumnProps {
  id: string
  title: string
  color: string
  ideas: Idea[]
  onStatusChange?: (taskId: string, newStatus: string) => void
  onDelete?: (taskId: string) => void
}

export default function Column({ id, title, color, ideas, onStatusChange, onDelete }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  const isMobile = useIsMobile()

  return (
    <div
      ref={setNodeRef}
      className={`state flex flex-col rounded-lg border-2 p-4 transition-colors ${color} ${isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''
        }`}
    >
      {/* Header de columna */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm text-gray-600 md:text-base lg:text-lg font-bold">
          {title}
        </h2>
        <span className="text-xs bg-white px-2 py-1 text-gray-500 rounded-full font-semibold">
          {ideas.length}
        </span>
      </div>

      {/* Lista de ideas */}
      <div className="list flex flex-col gap-2 flex-1 min-h-[100px]">
        {ideas.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            {isMobile ? (
                <span>No hay tareas</span>
              ): (
                <span>Arrastra tareas aquí</span>
              )}
            </p>

        ) : (
          ideas.map(idea => (
            <TaskCard
              key={idea.id}
              idea={idea}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}