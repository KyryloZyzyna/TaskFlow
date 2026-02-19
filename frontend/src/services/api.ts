import axios from 'axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials, Board, Task, BoardMember } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для додавання токену до кожного запиту
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (credentials: RegisterCredentials) =>
    api.post<AuthResponse>('/auth/register', credentials),

  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),

  getMe: () =>
    api.get('/auth/me'),
};

// Board API
export const boardAPI = {
  getAll: () =>
    api.get<{ boards: Board[] }>('/boards'),

  getOne: (id: string) =>
    api.get<{ board: Board }>(`/boards/${id}`),

  create: (title: string) =>
    api.post<{ board: Board }>('/boards', { title }),

  update: (id: string, title: string) =>
    api.put<{ board: Board }>(`/boards/${id}`, { title }),

  delete: (id: string) =>
    api.delete(`/boards/${id}`),

  createColumn: (boardId: string, title: string) =>
    api.post('/boards/columns', { boardId, title }),

  // Нові методи для членів
  inviteMember: (boardId: string, email: string) =>
    api.post<{ member: BoardMember }>('/boards/members/invite', { boardId, email }),

  removeMember: (boardId: string, userId: string) =>
    api.post('/boards/members/remove', { boardId, userId }),

  getMembers: (boardId: string) =>
    api.get<{ members: BoardMember[] }>(`/boards/${boardId}/members`),
};

// Task API
export const taskAPI = {
  create: (columnId: string, title: string, description?: string) =>
    api.post<{ task: Task }>('/tasks', { columnId, title, description }),

  update: (id: string, data: { title?: string; description?: string }) =>
    api.put<{ task: Task }>(`/tasks/${id}`, data),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`),

  move: (id: string, columnId: string, position: number) =>
    api.put<{ task: Task }>(`/tasks/${id}/move`, { columnId, position }),
};

export default api;