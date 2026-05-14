// src/services/syncService.ts
import NetInfo from '@react-native-community/netinfo';
import { db } from '../api/firebase';
import { databaseService } from './database';
import { Task } from '../types';

class SyncService {
  private static instance: SyncService;
  private isSyncing = false;
  private unsubscribe: (() => void) | null = null;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  startSyncListener() {
    this.unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isSyncing) {
        this.syncPendingTasks();
      }
    });
  }

  stopSyncListener() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async syncTaskToCloud(task: Task): Promise<void> {
    try {
      const taskRef = db.collection('tasks').doc(task.id);
      const taskData = {
        userId: task.userId,
        title: task.title,
        description: task.description || '',
        completed: task.completed,
        dueDate: task.dueDate || null,
        reminderDate: task.reminderDate || null,
        createdAt: task.createdAt,
        updatedAt: Date.now(),
      };

      await taskRef.set(taskData, { merge: true });
      
      await databaseService.updateTask({
        ...task,
        syncStatus: 'synced',
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error syncing task:', error);
      await databaseService.updateTask({
        ...task,
        syncStatus: 'failed',
      });
    }
  }

  async deleteTaskFromCloud(taskId: string): Promise<void> {
    try {
      await db.collection('tasks').doc(taskId).delete();
    } catch (error) {
      console.error('Error deleting task from cloud:', error);
    }
  }

  async syncPendingTasks(): Promise<void> {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    
    try {
      // Get all unsynced tasks from local DB
      // This would need the userId, which we get from Redux store
      const state = await import('../store').then(m => m.store.getState());
      const userId = state.auth.user?.uid;
      
      if (!userId) return;
      
      const unsyncedTasks = await databaseService.getUnsyncedTasks(userId);
      
      for (const task of unsyncedTasks) {
        await this.syncTaskToCloud(task);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = SyncService.getInstance();