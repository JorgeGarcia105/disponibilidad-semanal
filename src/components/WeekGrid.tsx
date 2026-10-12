'use client';

import { useRef, useEffect, useState, MouseEvent, TouchEvent } from 'react';
import { DayKey, DAYS, HOURS, DAY_LABELS } from '@/lib/types';
import { formatHour } from '@/lib/utils';
import { clsx } from 'clsx';

interface WeekGridProps {
  availability: Record<DayKey, number[]>;
  onToggleHour: (day: DayKey, hour: number) => void;
  onToggleRange?: (day: DayKey, start: number, end: number) => void;
  readOnly?: boolean;
  highlightHours?: number[];
}

export function WeekGrid({
  availability,
  onToggleHour,
  onToggleRange,
  readOnly = false,
  highlightHours = []
}: WeekGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ day: DayKey; hour: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ day: DayKey; hour: number } | null>(null);
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const isSelected = (day: DayKey, hour: number) => availability[day]?.includes(hour) ?? false;
  const isHighlighted = (hour: number) => highlightHours.includes(hour);

  const handleMouseDown = (day: DayKey, hour: number, e: MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ day, hour });
    setDragCurrent({ day, hour });
    onToggleHour(day, hour);
  };

  const handleMouseEnter = (day: DayKey, hour: number) => {
    if (!isDragging || !dragStart || readOnly) return;
    if (day !== dragStart.day) return;
    setDragCurrent({ day, hour });
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragCurrent && onToggleRange) {
      const start = Math.min(dragStart.hour, dragCurrent.hour);
      const end = Math.max(dragStart.hour, dragCurrent.hour);
      onToggleRange(dragStart.day, start, end);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const handleTouchStart = (day: DayKey, hour: number, e: TouchEvent<HTMLDivElement>) => {
    if (readOnly) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ day, hour });
    setDragCurrent({ day, hour });
    onToggleHour(day, hour);
  };

  const handleTouchMove = (day: DayKey, hour: number, e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || readOnly) return;
    if (day !== dragStart.day) return;
    setDragCurrent({ day, hour });
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  const getCellClass = (day: DayKey, hour: number) => {
    const selected = isSelected(day, hour);
    const highlighted = isHighlighted(hour);
    const inDragRange = isDragging && dragStart && dragCurrent && 
      day === dragStart.day && 
      hour >= Math.min(dragStart.hour, dragCurrent.hour) && 
      hour <= Math.max(dragStart.hour, dragCurrent.hour);

    return clsx(
      'relative aspect-square min-h-[36px] min-w-[36px] border transition-all duration-100',
      'touch-none select-none',
      selected 
        ? 'bg-green-500 border-green-600' 
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700',
      highlighted && 'ring-2 ring-blue-400',
      inDragRange && !selected && 'bg-green-200 dark:bg-green-900/30',
      readOnly && 'cursor-default hover:bg-transparent',
      !readOnly && 'cursor-pointer active:scale-[0.98]'
    );
  };

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-4">
      <table className="w-full min-w-max border-collapse" role="grid">
        <thead>
          <tr>
            <th className="sticky left-0 w-20 min-w-20 px-2 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
              Hora
            </th>
            {DAYS.map(day => (
              <th key={day} className="px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-5">
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map(hour => (
            <tr key={hour}>
              <td className="sticky left-0 w-20 min-w-20 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-10 font-mono">
                {formatHour(hour)}
              </td>
              {DAYS.map(day => (
                <td key={day}>
                  <div
                    ref={el => {
                      if (el) cellRefs.current.set(`${day}-${hour}`, el);
                    }}
                    className={getCellClass(day, hour)}
                    onMouseDown={e => handleMouseDown(day, hour, e)}
                    onMouseEnter={() => handleMouseEnter(day, hour)}
                    onTouchStart={e => handleTouchStart(day, hour, e)}
                    onTouchMove={e => handleTouchMove(day, hour, e)}
                    role="button"
                    tabIndex={readOnly ? -1 : 0}
                    onKeyDown={e => {
                      if (!readOnly && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onToggleHour(day, hour);
                      }
                    }}
                    aria-label={`${DAY_LABELS[day]} ${formatHour(hour)}: ${isSelected(day, hour) ? 'Disponible' : 'No disponible'}`}
                    aria-pressed={isSelected(day, hour)}
                  >
                    {isSelected(day, hour) && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold pointer-events-none">
                        ✓
                      </span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}