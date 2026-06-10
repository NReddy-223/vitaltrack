// ── existing types (unchanged) ────────────────────────────────────────────────

export interface PersonalDetails {
  fullName: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  healthGoal: string;
}

export interface DailyHealthLog {
  waterIntake: string;
  exercise: string;
  sleepHours: string;
  mood: string;
  calories: string;
  steps: string;
}

export type Mood = 'happy' | 'neutral' | 'tired' | 'stressed' | 'energetic';

export interface MoodOption {
  value: Mood;
  emoji: string;
  label: string;
}

export type Screen = 'login' | 'dashboard' | 'personal-details' | 'daily-log' | 'confirmation';

export interface AppData {
  personalDetails: PersonalDetails | null;
  healthLogs: DailyHealthLog[];
}

// ── new auth types ────────────────────────────────────────────────────────────

export interface AuthState {
  token: string | null;
  userId: string | null;
}
