// App.tsx
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotifications } from './src/utils/notifications';
import { syncService } from './src/services/syncService';
import { ThemeProvider } from './src/theme/ThemeContext';
import { firebaseAuth } from './src/api/firebase';
import { setAuthLoading, setAuthUser } from './src/store/slices/authSlice';
import { AppDispatch } from './src/store';

const AppShell: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setAuthLoading(true));

    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      dispatch(setAuthUser(user ? {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? undefined,
      } : null));
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <AppNavigator />;
};

const App: React.FC = () => {
  useEffect(() => {
    setupNotifications();
    syncService.startSyncListener();

    return () => {
      syncService.stopSyncListener();
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </Provider>
  );
};

export default App;