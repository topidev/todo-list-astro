import { useEffect } from 'react'
import type { Status } from '../../types/types'


interface StatusOption {
  id: Status
  title: string
  icon: string
  color: string
}

const STATUS_OPTIONS: StatusOption[] = [
  { id: 'new', title: 'Ideas', icon: '💡', color: 'hover:bg-blue-50' },
  { id: 'inProgress', title: 'En Proceso', icon: '🚀', color: 'hover:bg-yellow-50' },
  { id: 'paused', title: 'Pausada', icon: '⏸️', color: 'hover:bg-orange-50' },
  { id: 'finished', title: 'Terminadas', icon: '✅', color: 'hover:bg-green-50' },
  { id: 'dropped', title: 'Abandonada', icon: '❌', color: 'hover:bg-red-50' },
]

interface StatusMenuProps {
  currentStatus: string
  onSelect: (status: string) => void
  onClose: () => void
}

export default function StatusMenu({ currentStatus, onSelect, onClose }: StatusMenuProps) {
  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.status-menu')) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <>
      {/* Overlay oscuro */}
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />

      {/* Menú */}
      <div className="status-menu fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden animate-slide-up">
        {/* Handle para arrastrar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Mover tarea a:
          </h3>

          <div className="space-y-2">
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                disabled={option.id === currentStatus}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  option.id === currentStatus
                    ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                    : `border-gray-200 ${option.color} shadow-md active:scale-95 active:shadow`
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="flex-1 text-left font-medium">{option.title}</span>
                {option.id === currentStatus && (
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded-full">
                    Actual
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}