import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useBoard } from '../../hooks/useBoard';
import { formatDate, getUrgency } from '../../lib/taskUtils';
import { Button } from '../ui/button';
import { ArrowBigLeftDash } from 'lucide-react';

export default function GeneralDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { resumeBoard } = useBoard();

  useEffect(() => {
    if (user) {
        resumeBoard(user.uid).then(allTasks => {
            setTasks(allTasks);
            setLoadingTasks(false);
        });
    }
  }, [user]);

  // Clasificación de tareas
  const urgentTasks = tasks.filter(t => t.status !== "finished" && getUrgency(t.dueDate) === 'urgent');
  const upcomingTasks = tasks.filter(t => t.status !== "finished" && getUrgency(t.dueDate) === 'upcoming');
  const noDateTasks = tasks.filter(t => t.status !== "finished" && !t.dueDate);

  if (authLoading || loadingTasks) return <p>Cargando...</p>;

  return (
    <section className='max-w-[1600px] w-full mx-auto p-4'>
      <div className='flex gap-2 items-center'>
        <Button
          variant='link'
          onClick={() => window.location.href= '/'}
          className='group focus:scale-90 transition-all'
        >
          <ArrowBigLeftDash 
            className='group-hover:-translate-x-1 transition-transform duration-350'
          />
        </Button>
        <h1 className='text-2xl font-bold my-5'>Panel General</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Columna: Vencidas / Urgentes */}
        {user && urgentTasks.length > 0 && (
          <div className="bg-red-100 p-4 rounded-xl border border-red-100 flex-1 min-w-[300px]">
              <h2 className="font-bold text-red-700 mb-4 flex items-center">⚠️ Vencidas</h2>
              {urgentTasks.map(task => <TaskItem key={task.id} task={task} />)}
          </div>
        )}

        {/* Columna: Próximas a vencer */}
        {user && upcomingTasks.length > 0 && (
          <div className="bg-orange-100 p-4 rounded-xl border border-orange-100 flex-1 min-w-[300px]">
              <h2 className="font-bold text-orange-700 mb-4">⏳ Próximos 3 días</h2>
              {upcomingTasks.map(task => <TaskItem key={task.id} task={task} />)}
          </div>
        )}

        {/* Columna: Sin fecha */}
        {user && noDateTasks.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-xl border border-gray-100 flex-1 min-w-[300px]">
              <h2 className="font-bold text-gray-700 mb-4">📋 Sin fecha</h2>
              {noDateTasks.map(task => <TaskItem key={task.id} task={task} />)}
          </div>
        )}
      </div>
    </section>
  );
}

// Componente pequeño para la tarjeta de tarea
function TaskItem({ task }: { task: any }) {
    return (
        <div className="bg-white p-3 mb-3 rounded shadow-sm border-l-4" style={{ borderColor: task.boardColor }}>
            <p className="font-semibold text-gray-800">{task.text}</p>
            <div className="flex justify-between items-start mt-2 text-[10px] uppercase tracking-wider flex-col lg:items-center lg:flex-row gap-2">
                <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {task.boardName}
                </span>
                {task.dueDate && (
                    <span className="text-red-500 font-bold">{formatDate(task.dueDate)}</span>
                )}
            </div>
        </div>
    );
}