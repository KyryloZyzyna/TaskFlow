export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface BoardMember {
  id?: string;
  user: User;
  role: string;
  isOwner: boolean;
  createdAt?: string;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  columns: Column[];
  owner?: User;
  members?: BoardMember[];
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
}