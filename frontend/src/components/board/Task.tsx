import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';
import type { Task as TaskType } from '../../types';

interface TaskProps {
  task: TaskType;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, data: { title?: string; description?: string }) => void;
}

export default function Task({ task, onDelete, onUpdate }: TaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
        >
          <GripVertical size={16} />
        </button>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 break-words">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 break-words">{task.description}</p>
          )}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500 transition-colors mt-1"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}