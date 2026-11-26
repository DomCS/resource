
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { AppData, emptyData } from '../lib/types';

type AppDataContextValue = {
  data: AppData;
  ready: boolean;
  update: (updater: (current: AppData) => AppData) => void;
};

const STORAGE_KEY = 'business-manager-v1';

const AppDataContext =
  createContext<AppDataContextValue | null>(null);

export function AppDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed: Partial<AppData> = JSON.parse(saved);

          setData({
            ...emptyData,
            ...parsed,
          });
        }
      } catch (error) {
        console.error('Failed to load application data:', error);
      } finally {
        setReady(true);
      }
    }

    void loadData();
  }, []);

  useEffect(() => {
    if (!ready) return;

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data),
    ).catch(error => {
      console.error('Failed to save application data:', error);
    });
  }, [data, ready]);

  const update: AppDataContextValue['update'] = updater => {
    setData(current => updater(current));
  };

  return (
    <AppDataContext.Provider value={{ data, ready, update }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error(
      'useAppData must be used inside AppDataProvider',
    );
  }

  return context;
}
