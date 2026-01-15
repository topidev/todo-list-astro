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
    onStatusChange: (taskId: string, newStatus: string) => void
    onDelete?: (taskId: string) => void
}

export default function ColumnGrid({ grid, ideasList, onStatusChange, onDelete }: GridProps) {

    // Filtrar ideas por status
    const getIdeasByStatus = (status: Status) => {
        return ideasList.filter(idea => idea.status === status)
    }

    return (
        <main className="container-list w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {grid.map(column => (
                <Column
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    color={column.color}
                    ideas={getIdeasByStatus(column.id)}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                />
            ))}
        </main>
    )
}