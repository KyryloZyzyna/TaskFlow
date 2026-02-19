import { prisma } from '../server.js';

export const checkBoardAccess = async (req, res, next) => {
  try {
    const boardId = req.params.id || req.body.boardId;
    const userId = req.user.userId;

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID required' });
    }

    // Перевірити чи користувач має доступ (owner або member)
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      }
    });

    if (!board) {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.board = board;
    req.isOwner = board.ownerId === userId;
    next();
  } catch (error) {
    console.error('Board access check error:', error);
    res.status(500).json({ error: 'Access check failed' });
  }
};