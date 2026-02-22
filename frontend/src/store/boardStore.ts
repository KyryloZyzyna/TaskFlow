import { create } from 'zustand';
import { boardAPI, taskAPI } from '../services/api';
import type { Board, Task } from '../types';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;

  fetchBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (title: string) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  createTask: (columnId: string, title: string, description?: string) => Promise<void>;
  updateTask: (taskId: string, data: { title?: string; description?: string }) => Promise<void>;
  moveTask: (taskId: string, columnId: string, position: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateLocalBoard: (board: Board) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,

  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardAPI.getAll();
      set({ boards: response.data.boards, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch boards',
        isLoading: false
      });
    }
  },

  fetchBoard: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardAPI.getOne(id);
      set({ currentBoard: response.data.board, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch board',
        isLoading: false
      });
    }
  },

  createBoard: async (title: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardAPI.create(title);
      set(state => ({
        boards: [response.data.board, ...state.boards],
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create board',
        isLoading: false
      });
      throw error;
    }
  },

  deleteBoard: async (id: string) => {
    try {
      await boardAPI.delete(id);
      set(state => ({
        boards: state.boards.filter(b => b.id !== id),
        currentBoard: state.currentBoard?.id === id ? null : state.currentBoard
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete board' });
      throw error;
    }
  },

  createTask: async (columnId: string, title: string, description?: string) => {
    try {
      const response = await taskAPI.create(columnId, title, description);
      const task = response.data.task;

      set(state => {
        if (!state.currentBoard) return state;

        const updatedColumns = state.currentBoard.columns.map(col => {
          if (col.id === columnId) {
            return { ...col, tasks: [...col.tasks, task] };
          }
          return col;
        });

        return {
          currentBoard: { ...state.currentBoard, columns: updatedColumns }
        };
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to create task' });
      throw error;
    }
  },

  updateTask: async (taskId: string, data: { title?: string; description?: string }) => {
    try {
      const response = await taskAPI.update(taskId, data);
      const updatedTask = response.data.task;

      set(state => {
        if (!state.currentBoard) return state;

        const updatedColumns = state.currentBoard.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          )
        }));

        return {
          currentBoard: { ...state.currentBoard, columns: updatedColumns }
        };
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update task' });
      throw error;
    }
  },

  moveTask: async (taskId: string, columnId: string, position: number) => {
    try {
      await taskAPI.move(taskId, columnId, position);

      set(state => {
        if (!state.currentBoard) return state;

        let movedTask: Task | null = null;
        const columnsWithoutTask = state.currentBoard.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(task => {
            if (task.id === taskId) {
              movedTask = { ...task, columnId, position };
              return false;
            }
            return true;
          })
        }));

        if (!movedTask) return state;

        const updatedColumns = columnsWithoutTask.map(col => {
          if (col.id === columnId) {
            const newTasks = [...col.tasks];
            newTasks.splice(position, 0, movedTask!);
            return {
              ...col,
              tasks: newTasks.map((task, idx) => ({ ...task, position: idx }))
            };
          }
          return col;
        });

        return {
          currentBoard: { ...state.currentBoard, columns: updatedColumns }
        };
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to move task' });
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      await taskAPI.delete(taskId);

      set(state => {
        if (!state.currentBoard) return state;

        const updatedColumns = state.currentBoard.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(task => task.id !== taskId)
        }));

        return {
          currentBoard: { ...state.currentBoard, columns: updatedColumns }
        };
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete task' });
      throw error;
    }
  },

  updateLocalBoard: (board: Board) => {
    set({ currentBoard: board });
  },
}));