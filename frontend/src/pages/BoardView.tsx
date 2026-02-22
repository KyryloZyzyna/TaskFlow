import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { ArrowLeft, Users } from 'lucide-react';
import { useBoardStore } from '../store/boardStore';
import { socketService } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import Column from '../components/board/Column';
import MembersPanel from '../components/board/MembersPanel';
import type { Task as TaskType } from '../types';

export default function BoardView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const { currentBoard, fetchBoard, createTask, deleteTask, moveTask } = useBoardStore();
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [showMembers, setShowMembers] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (id) {
      fetchBoard(id);

      if (token) {
        socketService.connect(token);
        socketService.joinBoard(id);

        socketService.on('task:created', (data) => {
          console.log('Task created:', data);
          fetchBoard(id);
        });

        socketService.on('task:moved', (data) => {
          console.log('Task moved:', data);
          fetchBoard(id);
        });

        socketService.on('task:deleted', (data) => {
          console.log('Task deleted:', data);
          fetchBoard(id);
        });
      }
    }

    return () => {
      if (id) {
        socketService.leaveBoard(id);
      }
    };
  }, [id, fetchBoard, token]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = currentBoard?.columns
      .flatMap(col => col.tasks)
      .find(t => t.id === active.id);

    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !currentBoard) return;

    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;

    let sourceColumn = currentBoard.columns.find(col =>
      col.tasks.some(task => task.id === activeTaskId)
    );

    if (!sourceColumn) return;

    const task = sourceColumn.tasks.find(t => t.id === activeTaskId);
    if (!task) return;

    let targetColumn = currentBoard.columns.find(col => col.id === overColumnId);

    if (!targetColumn) {
      targetColumn = currentBoard.columns.find(col =>
        col.tasks.some(t => t.id === overColumnId)
      );
    }

    if (!targetColumn) return;

    let newPosition = 0;
    if (overColumnId !== targetColumn.id) {
      const overTaskIndex = targetColumn.tasks.findIndex(t => t.id === overColumnId);
      newPosition = overTaskIndex !== -1 ? overTaskIndex : targetColumn.tasks.length;
    } else {
      newPosition = targetColumn.tasks.length;
    }

    if (sourceColumn.id === targetColumn.id) {
      const oldIndex = sourceColumn.tasks.findIndex(t => t.id === activeTaskId);
      const newIndex = newPosition;

      if (oldIndex !== newIndex) {
        await moveTask(activeTaskId, targetColumn.id, newIndex);
        socketService.emit('task:moved', {
          boardId: currentBoard.id,
          taskId: activeTaskId,
          columnId: targetColumn.id,
          position: newIndex,
        });
      }
    } else {
      await moveTask(activeTaskId, targetColumn.id, newPosition);
      socketService.emit('task:moved', {
        boardId: currentBoard.id,
        taskId: activeTaskId,
        columnId: targetColumn.id,
        position: newPosition,
      });
    }
  };

  const handleCreateTask = async (columnId: string, title: string, description?: string) => {
    await createTask(columnId, title, description);
    if (currentBoard) {
      socketService.emit('task:created', {
        boardId: currentBoard.id,
        task: { columnId, title, description },
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    if (currentBoard) {
      socketService.emit('task:deleted', {
        boardId: currentBoard.id,
        taskId,
      });
    }
  };

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-primary">{currentBoard.title}</h1>
            </div>
            <button
              onClick={() => setShowMembers(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Users size={20} />
              Members
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4">
            {currentBoard.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onCreateTask={handleCreateTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-primary opacity-90">
                <h4 className="font-medium text-gray-900">{activeTask.title}</h4>
                {activeTask.description && (
                  <p className="text-sm text-gray-600 mt-1">{activeTask.description}</p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {showMembers && (
        <MembersPanel
          boardId={currentBoard.id}
          isOwner={currentBoard.ownerId === user?.id}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
}