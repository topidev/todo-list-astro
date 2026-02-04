import { useDroppable } from '@dnd-kit/core'
import type { Idea } from '../../types/types'
import TaskCard from './taskCard'
import { useIsMobile } from '../../layouts/useMediaQuery'
import { useEffect, useMemo, useState } from 'react'
import { Search, SidebarOpen, X } from 'lucide-react'
import { useDebounce } from 'use-debounce'

interface ColumnProps {
  id: string
  title: string
  color: string
  ideas: Idea[]
  onStatusChange?: (taskId: string, newStatus: string) => void
  onDelete?: (taskId: string) => void
  onEdit: (task: Idea) => void
}

export default function Column({ id, title, color, ideas, onStatusChange, onDelete, onEdit }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  const isMobile = useIsMobile()
  const [searchTask, setSearchTask] = useState('')
  const [openSearch, setOpenSearch] = useState(false)
  const [debounceSearch] = useDebounce(searchTask.toLocaleLowerCase(), 300)

  useEffect(() => {
    setSearchTask('')
    setOpenSearch(false)
  }, [ideas])


  const filteredIdeas = useMemo(() => {
    if (debounceSearch.trim() === '') return ideas

    const query = debounceSearch.trim()

    return ideas.filter(idea =>
      idea.text.toLowerCase().includes(query) ||
      idea.description?.toLowerCase().includes(query)
    )
  }, [ideas, debounceSearch])

  const maxSize = filteredIdeas.length >= 5

  return (
    <div
      ref={setNodeRef}
      className={`state flex flex-col rounded-lg border-2 p-4 transition-colors 
        ${color} ${isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
        ${maxSize ? 'overflow-y-scroll max-h-96 ' : ''}
        `}
    >
      {/* Header de columna */}
      <div className="flex flex-col items-center justify-between mb-3">
        <div className="flex w-full items-center justify-between mb-3">
          <h2 className="text-sm text-gray-600 md:text-base lg:text-lg font-bold">
            {title}
          </h2>
          <button
            className="text-xs cursor-pointer transition-all ring-1 rounded-full font-semibold 
             bg-transparent px-1 py-1 text-gray-500 
             hover:shadow-lg hover:ring-gray-700 hover:text-gray-700"
            onClick={() => {
              setOpenSearch(!openSearch)
              setSearchTask('')
            }}
            title={openSearch ? "Cerrar búsqueda" : "Buscar tareas"}
          >
            {openSearch ? (
              <X className='h-4 w-4' />
            ) : (
              <Search className='h-4 w-4' />

            )}
          </button>
        </div>
        {openSearch && (
          <input
            autoFocus
            type='text'
            placeholder='Buscar tareas...'
            className={`w-full border-2 text-gray-800 rounded border-gray-400 bg-gray-100 h-8 text-sm px-2 py-1
              ${openSearch ? 'block' : 'hidden'}
            `}
            value={searchTask}
            onChange={e => setSearchTask(e.target.value)}
          />
        )}
      </div>

      {/* Lista de ideas */}
      <div className="list flex flex-col gap-2 flex-1 min-h-[100px] pb-4">
        {filteredIdeas.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            {searchTask ? (
              <span>No se encontraron tareas</span>
            ) : isMobile ? (
              <span>No hay tareas</span>
            ) : (
              <span>Arrastra tareas aquí</span>
            )}
          </p>

        ) : (
          filteredIdeas.map(idea => (
            <TaskCard
              key={idea.id}
              idea={idea}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
        <br></br>
      </div>
    </div>
  )
}