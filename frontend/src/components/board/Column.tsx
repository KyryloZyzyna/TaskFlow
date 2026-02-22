import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import Task from './Task';
import type { Column as ColumnType } from '../../types';

interface ColumnProps {
  column: ColumnType;
  onCreateTask: (columnId: string, title: string, description?: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function Column({ column, onCreateTask, onDeleteTask }: ColumnProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    await onCreateTask(column.id, taskTitle, taskDescription);
    setTaskTitle('');
    setTaskDescription('');
    setShowAddTask(false);
  };

  const taskIds = column.tasks.map(task => task.id);

  return (
    <div className="bg-gray-100 rounded-lg p-4 min-w-[300px] max-w-[300px] flex flex-col max-h-[calc(100vh-200px)]">
      {/* Column Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">{column.title}</h3>
        <span className="text-sm text-gray-500">{column.tasks.length}</span>
      </div>

      {/* Tasks List */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-2 mb-3">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <Task
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Task */}
      {showAddTask ? (
        <form onSubmit={handleAddTask} className="space-y-2">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="input-field text-sm"
            autoFocus
          />
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="input-field text-sm resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm flex-1">
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddTask(false);
                setTaskTitle('');
                setTaskDescription('');
              }}
              className="btn-secondary text-sm flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddTask(true)}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={16} />
          Add task
        </button>
      )}
    </div>
  );
}