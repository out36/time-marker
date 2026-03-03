import { format, addMinutes, startOfDay } from 'date-fns';

export const START_HOUR = 5;
export const END_HOUR = 22;
export const INTERVAL_MINUTES = 5;

// Total slots: (22 - 5) * 60 / 5 = 204
export const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / INTERVAL_MINUTES;

export const getSlotTime = (index: number): string => {
  const start = startOfDay(new Date());
  start.setHours(START_HOUR, 0, 0, 0);
  const time = addMinutes(start, index * INTERVAL_MINUTES);
  return format(time, 'HH:mm');
};

export const getTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    slots.push(getSlotTime(i));
  }
  return slots;
};

export const getSlotIndexFromTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const totalMinutes = (hours - START_HOUR) * 60 + minutes;
  return Math.floor(totalMinutes / INTERVAL_MINUTES);
};

export const formatTimeRange = (startIndex: number, endIndex: number): string => {
  const start = getSlotTime(startIndex);
  // End time is the start of the next slot
  const end = getSlotTime(endIndex + 1);
  return `${start} - ${end}`;
};
