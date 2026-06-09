import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Screen, PersonalDetails, DailyHealthLog } from '../types';
import { apiGetProfile, apiGetHealthLogs } from '../services/api';

interface AppContextType {
  // screen navigation
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;

  // auth - lives in memory only, never in localStorage
  authToken: string | null;
  userId: string | null;
  isLoggedIn: boolean;
  login: (token: string, userId: string, fullName: string) => void;
  logout: () => void;

  // health data
  personalDetails: PersonalDetails | null;
  setPersonalDetails: (details: PersonalDetails) => void;
  healthLogs: DailyHealthLog[];
  addHealthLog: (log: DailyHealthLog) => void;

  // loading & errors
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  apiError: string | null;
  setApiError: (msg: string | null) => void;

  // fetch real data from backend
  refreshFromApi: () => Promise<void>;

  // legacy helper
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  // auth - no localStorage
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId]       = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // data
  const [personalDetails, setPersonalDetailsState] = useState<PersonalDetails | null>(null);
  const [healthLogs, setHealthLogs] = useState<DailyHealthLog[]>([]);

  // ui state
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError]   = useState<string | null>(null);

  // ── auth actions ────────────────────────────────────────────────────────────

  const login = useCallback((token: string, uid: string, fullName: string) => {
    setAuthToken(token);
    setUserId(uid);
    setIsLoggedIn(true);
    // pre-populate name so dashboard shows it immediately
    setPersonalDetailsState(prev => prev ?? {
      fullName,
      age: '', gender: '', weight: '', height: '', healthGoal: '',
    });
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUserId(null);
    setIsLoggedIn(false);
    setPersonalDetailsState(null);
    setHealthLogs([]);
    setCurrentScreen('login');
  }, []);

  // ── data helpers ────────────────────────────────────────────────────────────

  const setPersonalDetails = useCallback((details: PersonalDetails) => {
    setPersonalDetailsState(details);
  }, []);

  const addHealthLog = useCallback((log: DailyHealthLog) => {
    setHealthLogs(prev => [...prev, log]);
  }, []);

  // pull latest profile + logs from the backend after login
  const refreshFromApi = useCallback(async () => {
    if (!authToken || !userId) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const [profile, logs] = await Promise.all([
        apiGetProfile(userId, authToken),
        apiGetHealthLogs(userId, authToken),
      ]);

      if (profile) {
        setPersonalDetailsState({
          fullName:   profile.full_name,
          age:        String(profile.age),
          gender:     profile.gender,
          weight:     String(profile.weight),
          height:     String(profile.height),
          healthGoal: profile.health_goal,
        });
      }

      // map snake_case API response → camelCase app types
      setHealthLogs(
        logs.map(l => ({
          waterIntake: String(l.water_intake),
          exercise:    String(l.exercise_minutes),
          sleepHours:  String(l.sleep_hours),
          mood:        l.mood,
          calories:    String(l.calories),
          steps:       String(l.steps),
        }))
      );
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [authToken, userId]);

  const resetApp = useCallback(() => {
    setCurrentScreen('dashboard');
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentScreen, setCurrentScreen,
        authToken, userId, isLoggedIn,
        login, logout,
        personalDetails, setPersonalDetails,
        healthLogs, addHealthLog,
        isLoading, setIsLoading,
        apiError, setApiError,
        refreshFromApi,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
