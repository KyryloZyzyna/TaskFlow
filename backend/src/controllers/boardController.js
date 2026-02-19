import { prisma } from '../server.js';

// Get всі boards користувача (owned + shared)
export const getBoards = async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: req.user.userId },
          { members: { some: { userId: req.user.userId } } }
        ]
      },
      include: {
        columns: {
          include: {
            tasks: {
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { position: 'asc' }
        },
        owner: {
          select: { id: true, email: true, name: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
};

// Get один board
export const getBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await prisma.board.findFirst({
      where: {
        id,
        ownerId: req.user.userId
      },
      include: {
        columns: {
          include: {
            tasks: {
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json({ board });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
};

// Створити board
export const createBoard = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Створюємо board з дефолтними колонками
    const board = await prisma.board.create({
      data: {
        title,
        ownerId: req.user.userId,
        columns: {
          create: [
            { title: 'To Do', position: 0 },
            { title: 'In Progress', position: 1 },
            { title: 'Done', position: 2 }
          ]
        }
      },
      include: {
        columns: {
          include: {
            tasks: true
          }
        }
      }
    });

    res.status(201).json({ board });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
};

// Оновити board
export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const board = await prisma.board.findFirst({
      where: { id, ownerId: req.user.userId }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const updated = await prisma.board.update({
      where: { id },
      data: { title },
      include: {
        columns: {
          include: { tasks: true }
        }
      }
    });

    res.json({ board: updated });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
};

// Видалити board
export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await prisma.board.findFirst({
      where: { id, ownerId: req.user.userId }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    await prisma.board.delete({ where: { id } });

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
};

// Створити колонку
export const createColumn = async (req, res) => {
  try {
    const { title, boardId } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ error: 'Title and boardId required' });
    }

    // Перевірка доступу до board
    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: req.user.userId }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Знайти максимальну позицію
    const maxPosition = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' }
    });

    const column = await prisma.column.create({
      data: {
        title,
        boardId,
        position: maxPosition ? maxPosition.position + 1 : 0
      },
      include: { tasks: true }
    });

    res.status(201).json({ column });
  } catch (error) {
    console.error('Create column error:', error);
    res.status(500).json({ error: 'Failed to create column' });
  }
};

// Запросити користувача до дошки
export const inviteMember = async (req, res) => {
  try {
    const { boardId, email } = req.body;

    if (!email || !boardId) {
      return res.status(400).json({ error: 'Email and boardId required' });
    }

    // Перевірка, що користувач owner
    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: req.user.userId }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found or access denied' });
    }

    // Знайти користувача по email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Перевірити, чи вже доданий
    const existing = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: user.id
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'User already a member' });
    }

    // Додати члена
    const member = await prisma.boardMember.create({
      data: {
        boardId,
        userId: user.id,
        role: 'member'
      },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    res.status(201).json({ member });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to invite member' });
  }
};

// Видалити члена з дошки
export const removeMember = async (req, res) => {
  try {
    const { boardId, userId } = req.body;

    // Перевірка, що користувач owner
    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: req.user.userId }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found or access denied' });
    }

    // Не можна видалити owner
    if (userId === board.ownerId) {
      return res.status(400).json({ error: 'Cannot remove board owner' });
    }

    await prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId
        }
      }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

// Отримати членів дошки
export const getBoardMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const members = await prisma.boardMember.findMany({
      where: { boardId: id },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    // Також включити owner
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    const allMembers = [
      { user: board.owner, role: 'owner', isOwner: true },
      ...members.map(m => ({ ...m, isOwner: false }))
    ];

    res.json({ members: allMembers });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
};