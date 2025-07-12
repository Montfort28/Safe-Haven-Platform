export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoodEntry {
  id: string;
  mood: number;
  notes?: string;
  date: string;
}

export interface GameProgress {
  id: string;
  userId: string;
  gamesPlayed: number;
  totalTime: number;
  achievements: string[];
  streak: number;
}

export interface MindGarden {
  id: string;
  userId: string;
  plants: number;
  flowers: number;
  health: number;
  lastCare: string;
}

export interface Affirmation {
  id: string;
  content: string;
  active: boolean;
}