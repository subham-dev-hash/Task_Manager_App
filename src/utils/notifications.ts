// src/utils/notifications.ts
import { Platform } from 'react-native';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { fcm } from '../api/firebase';

export const setupNotifications = async () => {
  await notifee.requestPermission();
  
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'task-reminders',
      name: 'Task Reminders',
    });
  }
  
  // Request FCM permission
  const authStatus = await fcm.requestPermission();
  if (authStatus === 1) {
    const token = await fcm.getToken();
    console.log('FCM Token:', token);
  }
};

export const scheduleTaskReminder = async (
  taskId: string,
  title: string,
  date: Date
) => {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
  };

  await notifee.createTriggerNotification(
    {
      id: taskId,
      title: 'Task Reminder',
      body: `Time to complete: ${title}`,
      android: {
        channelId: 'task-reminders',
      },
    },
    trigger
  );
};

export const cancelTaskReminder = async (taskId: string) => {
  await notifee.cancelNotification(taskId);
};