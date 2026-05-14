import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { addTask, updateTask } from '../../store/slices/taskSlice';
import { Task } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import Button from '../Button';
import Input from '../Input';
import { scheduleTaskReminder, cancelTaskReminder } from '../../utils/notifications';

type TaskFormProps = {
  task: Task | null;
  onClose: () => void;
};

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const userId = useSelector((state: RootState) => state.auth.user?.uid);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    if (task?.reminderDate) {
      const diffMinutes = Math.max(1, Math.round((task.reminderDate - Date.now()) / 60000));
      setReminderMinutes(String(diffMinutes));
    } else {
      setReminderMinutes('');
    }
  }, [task]);

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    const parsedMinutes = reminderMinutes.trim() ? Number.parseInt(reminderMinutes, 10) : null;
    const reminderDate = parsedMinutes && parsedMinutes > 0 ? Date.now() + parsedMinutes * 60000 : undefined;

    setSaving(true);
    try {
      if (task) {
        const result = await dispatch(
          updateTask({
            ...task,
            title: title.trim(),
            description: description.trim() || undefined,
            reminderDate,
          })
        );
        if (updateTask.fulfilled.match(result)) {
          if (task.reminderDate) {
            await cancelTaskReminder(task.id);
          }
          if (reminderDate) {
            await scheduleTaskReminder(task.id, title.trim(), new Date(reminderDate));
          }
        }
      } else if (userId) {
        const result = await dispatch(
          addTask({
            userId,
            title: title.trim(),
            description: description.trim() || undefined,
            completed: false,
            dueDate: undefined,
            reminderDate,
          })
        );
        if (addTask.fulfilled.match(result) && reminderDate) {
          await scheduleTaskReminder(result.payload.id, title.trim(), new Date(reminderDate));
        }
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {task ? 'Edit Task' : 'New Task'}
        </Text>
        <Input placeholder="Title" value={title} onChangeText={setTitle} />
        <Input
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />
        <Input
          placeholder="Reminder in minutes (optional)"
          value={reminderMinutes}
          onChangeText={setReminderMinutes}
          keyboardType="numeric"
        />
        <Button title="Save" onPress={handleSave} loading={saving} />
        <Button title="Cancel" onPress={onClose} variant="outline" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default TaskForm;