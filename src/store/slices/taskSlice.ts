// src/store/slices/tasksSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { databaseService } from '../../services/database';
import { syncService } from '../../services/syncService';
import { db } from '../../api/firebase';
import { Task, TasksState } from '../../types';

const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
  lastSyncTimestamp: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string) => {
    // Fetch from local DB first
    const localTasks = await databaseService.getTasks(userId);
    
    // Try to sync with cloud
    try {
      const cloudTasks = await db
        .collection('tasks')
        .where('userId', '==', userId)
        .get();
      
      const cloudTasksData = cloudTasks.docs.map((doc: any) => ({
        ...doc.data(),
        id: doc.id,
        syncStatus: 'synced' as const,
      })) as Task[];
      
      // Merge cloud and local tasks
      const mergedTasks = mergeTaskLists(localTasks, cloudTasksData);
      
      // Update local DB with merged tasks
      for (const task of mergedTasks) {
        await databaseService.addTask(task);
      }
      
      return mergedTasks;
    } catch (error) {
      // If offline, just return local tasks
      return localTasks;
    }
  }
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending',
    };
    
    await databaseService.addTask(newTask);
    syncService.syncTaskToCloud(newTask);
    
    return newTask;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (task: Task) => {
    const updatedTask: Task = {
      ...task,
      updatedAt: Date.now(),
      syncStatus: 'pending',
    };

    await databaseService.updateTask(updatedTask);
    syncService.syncTaskToCloud(updatedTask);

    return updatedTask;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ taskId, userId }: { taskId: string; userId: string }) => {
    await databaseService.deleteTask(taskId, userId);
    await syncService.deleteTaskFromCloud(taskId);

    return taskId;
  }
);

export const toggleTaskCompletion = createAsyncThunk(
  'tasks/toggleCompletion',
  async (taskId: string, { getState }) => {
    const state = getState() as { tasks: TasksState };
    const task = state.tasks.tasks.find(t => t.id === taskId);
    
    if (!task) throw new Error('Task not found');
    
    const updatedTask: Task = {
      ...task,
      completed: !task.completed,
      updatedAt: Date.now(),
      syncStatus: 'pending',
    };
    
    await databaseService.updateTask(updatedTask);
    syncService.syncTaskToCloud(updatedTask);
    
    return updatedTask;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
        state.lastSyncTimestamp = Date.now();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        } else {
          state.tasks.unshift(action.payload);
        }
      })
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      });
  },
});

function mergeTaskLists(localTasks: Task[], cloudTasks: Task[]): Task[] {
  const taskMap = new Map<string, Task>();
  
  // Add cloud tasks first (they're the source of truth)
  cloudTasks.forEach(task => taskMap.set(task.id, task));
  
  // Override with any local tasks that are newer
  localTasks.forEach(localTask => {
    const cloudTask = taskMap.get(localTask.id);
    if (!cloudTask || localTask.updatedAt > cloudTask.updatedAt) {
      taskMap.set(localTask.id, localTask);
    }
  });
  
  return Array.from(taskMap.values());
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default tasksSlice.reducer;