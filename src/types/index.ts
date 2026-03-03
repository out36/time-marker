export interface TimeBlock {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  themeId: string;
  notes: string;
  date: string;      // YYYY-MM-DD
}

export interface Theme {
  id: string;
  name: string;
  color: string;     // HEX
  description?: string;
}

export interface DailyReport {
  date: string;
  totalBlocks: number;
  themeStats: {
    themeId: string;
    totalMinutes: number;
    percentage: number;
  }[];
  blocks: TimeBlock[];
}

export const DEFAULT_THEMES: Theme[] = [
  { id: 'work', name: 'Work', color: '#3B82F6', description: 'Work related activities' },
  { id: 'study', name: 'Study', color: '#10B981', description: 'Learning and reading' },
  { id: 'rest', name: 'Rest', color: '#F59E0B', description: 'Rest and relaxation' },
  { id: 'exercise', name: 'Exercise', color: '#EF4444', description: 'Sports and fitness' },
  { id: 'social', name: 'Social', color: '#8B5CF6', description: 'Social activities' },
  { id: 'hobby', name: 'Hobby', color: '#06B6D4', description: 'Personal hobbies' },
  { id: 'meal', name: 'Meal', color: '#F97316', description: 'Dining time' },
  { id: 'other', name: 'Other', color: '#6B7280', description: 'Other activities' },
];
