import { prisma } from '../server.js';

// Створити task
export const createTask = async (req, res) => {
  try {
    const { title, description, columnId } = req.body;

    if (!title || !columnId) {
      return res.status(400).json({ error: 'Title and columnId required' });
    }

    // Перевірка доступу до колонки через board
    const column = await prisma.column.findFirst({
      where: { id: columnId },
      include: { board: true }
    });

    if (!column || column.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Column not found' });
    }

    // Знайти максимальну позицію в колонці
    const maxPosition = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: 'desc' }
    });

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        columnId,
        position: maxPosition ? maxPosition.position + 1 : 0
      }
    });

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Оновити task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Перевірка доступу
    const task = await prisma.task.findFirst({
      where: { id },
      include: {
        column: {
          include: { board: true }
        }
      }
    });

    if (!task || task.column.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: title || task.title,
        description: description !== undefined ? description : task.description
      }
    });

    res.json({ task: updated });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Видалити task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id },
      include: {
        column: {
          include: { board: true }
        }
      }
    });

    if (!task || task.column.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Перемістити task (змінити колонку або позицію)
export const moveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { columnId, position } = req.body;

    if (!columnId || position === undefined) {
      return res.status(400).json({ error: 'columnId and position required' });
    }

    // Перевірка доступу до task
    const task = await prisma.task.findFirst({
      where: { id },
      include: {
        column: {
          include: { board: true }
        }
      }
    });

    if (!task || task.column.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Перевірка доступу до нової колонки
    const newColumn = await prisma.column.findFirst({
      where: { id: columnId },
      include: { board: true }
    });

    if (!newColumn || newColumn.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Column not found' });
    }

    // Перемістити task
    const updated = await prisma.task.update({
      where: { id },
      data: {
        columnId,
        position
      }
    });

    res.json({ task: updated });
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ error: 'Failed to move task' });
  }
};