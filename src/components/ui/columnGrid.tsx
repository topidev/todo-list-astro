import type { Idea, Status } from "../../types/types"
import Column from "../toDo/column"

interface ColumType {
    id: Status;
    title: string;
    color: string
}

interface GridProps {
    // grid: Array<{ id: Status; title: string; color: string }>
    grid: ColumType[]
    ideasList: Idea[]
    onEdit: (task: Idea) => void
    onStatusChange: (taskId: string, newStatus: string) => void
    onDelete?: (taskId: string) => void
}

export default function ColumnGrid({ grid, ideasList, onStatusChange, onDelete, onEdit }: GridProps) {

    // Filtrar ideas por status
    const getIdeasByStatus = (status: Status) => {
        return ideasList.filter(idea => idea.status === status)
    }

    return (
        <main className="container-list w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {grid.slice(0, 4).map(column => (
                <Column
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    color={column.color}
                    ideas={getIdeasByStatus(column.id)}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            ))}

            {/* Última columna separada con col-span completo */}
            <div className="md:col-span-2 lg:col-span-4">
                <Column
                    key={grid[4].id}
                    id={grid[4].id}
                    title={grid[4].title}
                    color={grid[4].color}
                    ideas={getIdeasByStatus(grid[4].id)}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            </div>
        </main>
    )
}