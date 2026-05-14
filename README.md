# TaskManager - React Native Task Management App

Cross-platform task manager built with React Native, Firebase, Redux Toolkit, local SQLite storage, and Notifee notifications.

## Architecture Overview

### Core Decisions

1. **State Management - Redux Toolkit**
   - Centralized auth and task state
   - Async thunks for CRUD and sync operations
   - Firebase-backed session state via auth listener

2. **Offline-First Storage**
   - Local SQLite database for tasks
   - Firestore sync when connectivity returns
   - Last-write-wins timestamp strategy for merges

3. **Modular Structure**
   - Feature-oriented folders for screens, components, slices, and services
   - Shared UI components under `src/components`
   - Navigation and theme separated from feature logic

## Features Implemented

- Email/password sign up and login with Firebase Authentication
- Persistent auth session restoration on app launch
- Add, edit, delete, complete, and reopen tasks
- Local SQLite persistence with Firestore sync
- Offline detection and background sync trigger
- Local push notifications for task reminders
- Firebase Cloud Messaging permission/token setup
- Dark and light theme support
- React Navigation auth stack and app stack
- FlatList optimizations for task rendering

## Libraries Used

### Core
- React Native 0.85.3
- TypeScript 5.8.x
- React Navigation 7.x

### State and Data
- Redux Toolkit
- React Redux
- `@op-engineering/op-sqlite`
- `@react-native-async-storage/async-storage`

### Backend
- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/firestore`
- `@react-native-firebase/messaging`

### Notifications
- `@notifee/react-native`

## Folder Structure

```text
src/
  api/            Firebase wrapper
  components/     Shared and task UI components
  config/         Environment configuration
  hooks/         Network and helper hooks
  navigation/    Auth and app stacks
  screens/       Feature screens
  services/      Local DB and sync services
  store/         Redux store and slices
  theme/         Theme provider and palettes
  types/         Shared TypeScript types
  utils/         Notifications helpers
```

## Environment Files

The project includes sample files for all three environments:

- [.env.dev](.env.dev)
- [.env.staging](.env.staging)
- [.env.production](.env.production)

## Firebase Setup

Create two Firebase apps in the same Firebase project:

- iOS bundle id: `org.reactjs.native.example.Task_Management`
- Android package name: `com.task_management`

Add the config files already present in the repo:

- [ios/Task_Management/GoogleService-Info.plist](ios/Task_Management/GoogleService-Info.plist)
- [android/app/google-services.json](android/app/google-services.json)

Enable Authentication, Firestore, and Cloud Messaging in the Firebase console.

## Run Instructions

### Install

```bash
npm install
```

### iOS

```bash
cd ios
pod install
cd ..
npm run ios:dev
```

Use `ios:staging` or `ios:prod` for other environments.

### Android

```bash
npm run android:dev
```

Use `android:staging` or `android:prod` for other environments.

### Metro

```bash
npm run start
```

## Environment Variables

- `APP_ENV` selects `dev`, `staging`, or `production`
- `API_URL` controls the backend URL for each environment
- Firebase keys are loaded from the matching `.env` file

## Known Limitations

- Firestore sync uses a simple last-write-wins merge strategy.
- Reminder scheduling is local and based on a minute offset in the current form.
- Task deletion is supported from the detail screen.
- The app expects Firebase native configuration files to be present on both platforms.

## Notes

- The app uses Firebase Native SDKs, so session persistence is handled by Firebase automatically once the auth listener boots.
- If you switch environments, update the matching `.env.*` file and restart Metro.