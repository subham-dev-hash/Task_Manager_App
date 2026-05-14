// src/screens/tasks/TaskListScreen.tsx
import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from 'react-native';
import { AppDispatch, RootState } from '../../store';
import { fetchTasks, toggleTaskCompletion } from '../../store/slices/taskSlice';
import TaskItem from '../../components/tasks/TaskItem';
import TaskForm from '../../components/tasks/TaskForm';
import { useTheme } from '../../theme/ThemeContext';
import { useNetwork } from '../../hooks/useNetwork';
import { Task } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';

type TaskListScreenProps = NativeStackScreenProps<AppStackParamList, 'TaskList'>;

const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading } = useSelector((state: RootState) => state.tasks);
  const user = useSelector((state: RootState) => state.auth.user);
  const { theme } = useTheme();
  const isConnected = useNetwork();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchTasks(user.uid));
    }
  }, [dispatch, user?.uid]);

  const onRefresh = useCallback(() => {
    if (user?.uid) {
      dispatch(fetchTasks(user.uid));
    }
  }, [dispatch, user?.uid]);

  const handleToggleTask = (taskId: string) => {
    dispatch(toggleTaskCompletion(taskId));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onToggle={() => handleToggleTask(item.id)}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      onEdit={() => handleEditTask(item)}
    />
  ), [navigation]);

  const keyExtractor = useCallback((item: Task) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {!isConnected && (
        <View style={[styles.offlineBanner, { backgroundColor: theme.colors.error }]}>
          <Text style={styles.offlineText}>Offline Mode - Changes will sync when connected</Text>
        </View>
      )}
      
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No tasks yet. Tap + to add one!
            </Text>
          </View>
        }
        contentContainerStyle={tasks.length === 0 && styles.emptyList}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          setEditingTask(null);
          setShowForm(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineBanner: {
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TaskListScreen;