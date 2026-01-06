import { useDroppable } from '@dnd-kit/core'
import type { Idea } from '../../types/types'
import TaskCard from './taskCard'

interface ColumnProps {
  id: string
  title: string
  color: string
  ideas: Idea[]
}

export default function Column({ id, title, color, ideas }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`state flex flex-col rounded-lg border-2 p-4 transition-colors ${color} ${
        isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      }`}
    >
      {/* Header de columna */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-gray-500 text-sm md:text-base lg:text-lg font-bold">
          {title}
        </h2>
        <span className="text-gray-500 text-xs bg-white px-2 py-1 rounded-full font-semibold">
          {ideas.length}
        </span>
      </div>

      {/* Lista de ideas */}
      <div className="list flex flex-col gap-2 flex-1 min-h-[100px]">
        {ideas.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            Arrastra tareas aquí
          </p>
        ) : (
          ideas.map(idea => (
            <TaskCard key={idea.id} idea={idea} />
          ))
        )}
      </div>
    </div>
  )
}