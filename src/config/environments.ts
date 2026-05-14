// src/config/environments.ts
import { Platform } from 'react-native';

interface EnvironmentConfig {
  apiUrl: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  appName: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  switch (process.env.APP_ENV) {
    case 'staging':
      return {
        apiUrl: process.env.API_URL || 'https://staging-api.example.com',
        firebase: {
          apiKey: process.env.FIREBASE_API_KEY || '',
          authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
          projectId: process.env.FIREBASE_PROJECT_ID || '',
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
          appId: process.env.FIREBASE_APP_ID || '',
        },
        appName: 'TaskManager Staging',
      };
    case 'production':
      return {
        apiUrl: process.env.API_URL || 'https://api.example.com',
        firebase: {
          apiKey: process.env.FIREBASE_API_KEY || '',
          authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
          projectId: process.env.FIREBASE_PROJECT_ID || '',
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
          appId: process.env.FIREBASE_APP_ID || '',
        },
        appName: 'TaskManager',
      };
    default:
      return {
        apiUrl: process.env.API_URL || 'http://localhost:3000',
        firebase: {
          apiKey: process.env.FIREBASE_API_KEY || '',
          authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
          projectId: process.env.FIREBASE_PROJECT_ID || '',
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
          appId: process.env.FIREBASE_APP_ID || '',
        },
        appName: 'TaskManager Dev',
      };
  }
};

export const config = getEnvironmentConfig();
