// src/navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, TouchableOpacity } from 'react-native';
import TaskListScreen from '../screens/task/TaskListScreen';
import TaskDetailScreen from '../screens/task/TaskDetailScreen';
import { useTheme } from '../theme/ThemeContext';
import { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity onPress={toggleTheme}>
            <Text>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen 
        name="TaskList" 
        component={TaskListScreen}
        options={{ title: 'My Tasks' }}
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;