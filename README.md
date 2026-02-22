# TaskFlow

![Backend CI](https://github.com/KyryloZyzyna/TaskFlow/workflows/Backend%20CI/badge.svg)
![Frontend CI](https://github.com/KyryloZyzyna/TaskFlow/workflows/Frontend%20CI/badge.svg)

Real-time collaborative task management app with drag-and-drop functionality.

## ✨ Features

- JWT Authentication
- Board & task management with drag-and-drop
- Real-time sync via WebSocket
- Multi-user collaboration
- Responsive UI

## 📸 Screenshots

### Login
<p align="center">
  <img src="docs/screenshots/login.png" alt="Login Page" width="700">
</p>
<p align="center"><i>Secure authentication with JWT tokens and form validation</i></p>

### Sign Up
<p align="center">
  <img src="docs/screenshots/sign_up.png" alt="Registration Page" width="700">
</p>
<p align="center"><i>User registration with email and password</i></p>

### Board Management
<p align="center">
  <img src="docs/screenshots/board.png" alt="Kanban Board" width="700">
</p>
<p align="center"><i>Kanban-style board with drag-and-drop task management across columns</i></p>

### Team Collaboration
<p align="center">
  <img src="docs/screenshots/invite_members.png" alt="Invite Team Members" width="700">
</p>
<p align="center"><i>Invite users by email and manage board access permissions</i></p>



## 🛠️ Tech Stack

**Backend:** Node.js, Express, PostgreSQL, Socket.io  
**Frontend:** React, TypeScript, Vite, Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop

### Installation

1. **Clone & setup database:**
```bash
git clone https://github.com/KyryloZyzyna/TaskFlow.git
cd TaskFlow
docker-compose up -d
```

2. **Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run db:push
npm run dev
```

3. **Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

4. Open http://localhost:5173

## 📝 Environment Setup

**Backend `.env`:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskflow"
JWT_SECRET=your-secret-key
PORT=5000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

## 📡 Key Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/boards` - Get boards
- `POST /api/boards/members/invite` - Invite user
- `PUT /api/tasks/:id/move` - Move task

## 👤 Author

Kyrylo Zyzyna - Full-stack development learning project

## 📄 License

MIT
