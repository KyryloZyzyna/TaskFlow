import express from 'express';
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  createColumn,
  inviteMember,
  removeMember,
  getBoardMembers
} from '../controllers/boardController.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkBoardAccess } from '../middleware/boardAccess.js';

const router = express.Router();

// Всі routes захищені
router.use(authenticateToken);

// Board routes
router.get('/', getBoards);
router.post('/', createBoard);

// Routes з перевіркою доступу
router.get('/:id', checkBoardAccess, getBoard);
router.put('/:id', checkBoardAccess, updateBoard);
router.delete('/:id', checkBoardAccess, deleteBoard);

// Column routes
router.post('/columns', createColumn);

// Member routes
router.post('/members/invite', inviteMember);
router.post('/members/remove', removeMember);
router.get('/:id/members', checkBoardAccess, getBoardMembers);

export default router;