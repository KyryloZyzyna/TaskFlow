import express from 'express';
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Всі routes захищені
router.use(authenticateToken);

router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/move', moveTask);

export default router;