import { format, getISOWeek, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayKey, DAYS, HOURS } from './types';

export function getWeekKey(date?: Date): string {
  const d = date ?? new Date();
  const year = getYear(d);
  const week = getISOWeek(d);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

export function getAvailabilityKey(weekKey: string): string {
  return `availability:${weekKey}`;
}

export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

export function parseHour(label: string): number {
  return parseInt(label.split(':')[0], 10);
}

export function getDayName(date: Date): DayKey {
  const dayIndex = date.getDay(); // 0 = domingo, 1 = lunes
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return DAYS[adjustedIndex];
}

export function getWeekRange(weekKey: string): { start: Date; end: Date } {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  
  // Find first day of the year
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay(); // 0 = Sunday
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - ((dayOfWeek + 6) % 7));
  
  const start = new Date(firstMonday);
  start.setDate(firstMonday.getDate() + (week - 1) * 7);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export function formatWeekRange(weekKey: string): string {
  const { start, end } = getWeekRange(weekKey);
  return `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM yyyy', { locale: es })}`;
}

export function emptyAvailability(): Record<DayKey, number[]> {
  const obj = {} as Record<DayKey, number[]>;
  DAYS.forEach(day => obj[day] = []);
  return obj;
}

import { AllAvailability } from './types';

export function computeHeatmap(data: AllAvailability): Record<DayKey, Record<number, { count: number; available: string[]; unavailable: string[] }>> {
  const result: Record<DayKey, Record<number, { count: number; available: string[]; unavailable: string[] }>> = {} as any;
  
  DAYS.forEach(day => {
    result[day] = {};
    HOURS.forEach(hour => {
      result[day][hour] = { count: 0, available: [], unavailable: [] };
    });
  });
  
  Object.entries(data).forEach(([name, personData]) => {
    DAYS.forEach(day => {
      const hours = personData[day] || [];
      HOURS.forEach(hour => {
        if (hours.includes(hour)) {
          result[day][hour].count++;
          result[day][hour].available.push(name);
        } else {
          result[day][hour].unavailable.push(name);
        }
      });
    });
  });
  
  return result;
}