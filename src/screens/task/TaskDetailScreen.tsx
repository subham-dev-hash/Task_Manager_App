import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppDispatch, RootState } from '../../store';
import { deleteTask, toggleTaskCompletion } from '../../store/slices/taskSlice';
import { useTheme } from '../../theme/ThemeContext';
import Button from '../../components/Button';
import { AppStackParamList } from '../../navigation/types';
import { cancelTaskReminder } from '../../utils/notifications';

type TaskDetailScreenProps = NativeStackScreenProps<AppStackParamList, 'TaskDetail'>;

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ route, navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const task = useSelector((state: RootState) => state.tasks.tasks.find(item => item.id === route.params.taskId));

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Task not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{task.title}</Text>
      <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
        {task.completed ? 'Completed' : 'Open'}
      </Text>
      <Text style={[styles.description, { color: theme.colors.text }]}>
        {task.description || 'No description provided.'}
      </Text>
      <Button title="Toggle Status" onPress={() => dispatch(toggleTaskCompletion(task.id))} />
      <Button
        title="Delete Task"
        onPress={async () => {
          await cancelTaskReminder(task.id);
          await dispatch(deleteTask({ taskId: task.id, userId: task.userId }));
          navigation.goBack();
        }}
        variant="outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  meta: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
});

export default TaskDetailScreen;