// src/services/database.ts
import { open } from '@op-engineering/op-sqlite';
import { Task } from '../types';

class DatabaseService {
  private db: any;
  private static instance: DatabaseService;

  private constructor() {
    this.init();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async init() {
    try {
      this.db = open({ name: 'tasks.db' });
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  private async createTables() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        due_date INTEGER,
        reminder_date INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        sync_status TEXT DEFAULT 'pending'
      );
    `);

    await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    `);
  }

  async getTasks(userId: string): Promise<Task[]> {
    const results = await this.db.execute(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return results.rows.map(this.mapRowToTask);
  }

  async addTask(task: Task): Promise<void> {
    await this.db.execute(
      `INSERT OR REPLACE INTO tasks 
       (id, user_id, title, description, completed, due_date, reminder_date, created_at, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.userId,
        task.title,
        task.description,
        task.completed ? 1 : 0,
        task.dueDate,
        task.reminderDate,
        task.createdAt,
        task.updatedAt,
        task.syncStatus,
      ]
    );
  }

  async updateTask(task: Task): Promise<void> {
    await this.db.execute(
      `UPDATE tasks SET 
       title = ?, description = ?, completed = ?, due_date = ?, 
       reminder_date = ?, updated_at = ?, sync_status = ?
       WHERE id = ? AND user_id = ?`,
      [
        task.title,
        task.description,
        task.completed ? 1 : 0,
        task.dueDate,
        task.reminderDate,
        task.updatedAt,
        task.syncStatus,
        task.id,
        task.userId,
      ]
    );
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    await this.db.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );
  }

  async getUnsyncedTasks(userId: string): Promise<Task[]> {
    const results = await this.db.execute(
      'SELECT * FROM tasks WHERE user_id = ? AND sync_status = ?',
      [userId, 'pending']
    );
    
    return results.rows.map(this.mapRowToTask);
  }

  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      completed: row.completed === 1,
      dueDate: row.due_date,
      reminderDate: row.reminder_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncStatus: row.sync_status,
    };
  }
}

export const databaseService = DatabaseService.getInstance();