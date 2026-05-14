import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../../types';
import { useTheme } from '../../theme/ThemeContext';

type TaskItemProps = {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
  onEdit: () => void;
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onPress, onEdit }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <View style={styles.row}>
        <View style={styles.flexOne}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{task.title}</Text>
          {task.description ? (
            <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.status, { color: task.completed ? theme.colors.success : theme.colors.primary }]}>
          {task.completed ? 'Done' : 'Open'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onToggle} style={[styles.actionButton, { borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.text }}>{task.completed ? 'Mark Open' : 'Complete'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onEdit} style={[styles.actionButton, { borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.text }}>Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexOne: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
});

export default TaskItem;