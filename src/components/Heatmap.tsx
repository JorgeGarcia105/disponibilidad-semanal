'use client';

import { useState } from 'react';
import { DayKey, DAYS, HOURS, DAY_LABELS } from '@/lib/types';
import { formatHour } from '@/lib/utils';
import { clsx } from 'clsx';
import { Button } from './ui/Button';

interface HeatmapCell {
  count: number;
  available: string[];
  unavailable: string[];
}

interface HeatmapProps {
  heatmap: Record<DayKey, Record<number, HeatmapCell>>;
  allNames: string[];
}

export function Heatmap({ heatmap, allNames }: HeatmapProps) {
  const [modal, setModal] = useState<{ day: DayKey; hour: number; cell: HeatmapCell } | null>(null);
  const maxCount = Math.max(...Object.values(heatmap).flatMap(d => Object.values(d).map(c => c.count)), 1);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    const intensity = count / maxCount;
    if (intensity <= 0.3) return 'bg-green-100 dark:bg-green-900/30';
    if (intensity <= 0.6) return 'bg-green-300 dark:bg-green-600';
    if (intensity <= 0.8) return 'bg-yellow-400 dark:bg-yellow-500';
    return 'bg-red-400 dark:bg-red-500';
  };

  const getTextColor = (count: number) => {
    if (count === 0) return 'text-gray-400 dark:text-gray-500';
    const intensity = count / maxCount;
    if (intensity > 0.6) return 'text-gray-900 dark:text-gray-100';
    return 'text-gray-700 dark:text-gray-300';
  };

  const openModal = (day: DayKey, hour: number) => {
    const cell = heatmap[day]?.[hour];
    if (cell) setModal({ day, hour, cell });
  };

  const closeModal = () => setModal(null);

  if (allNames.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">No hay datos de disponibilidad aún</p>
        <p className="text-sm">Que cada persona vaya a su pestaña y marque sus horas</p>
      </div>
    );
  }

  return (
    <>
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
                {DAYS.map(day => {
                  const cell = heatmap[day]?.[hour] ?? { count: 0, available: [], unavailable: [] };
                  return (
                    <td key={day}>
                      <button
                        className={clsx(
                          'w-full h-full min-h-[36px] min-w-[36px] border border-gray-200 dark:border-gray-700 transition-colors',
                          getColorClass(cell.count),
                          getTextColor(cell.count),
                          'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500',
                          cell.count > 0 ? 'cursor-pointer' : 'cursor-default'
                        )}
                        onClick={() => openModal(day, hour)}
                        disabled={cell.count === 0}
                        aria-label={`${DAY_LABELS[day]} ${formatHour(hour)}: ${cell.count} personas disponibles`}
                      >
                        <span className="flex h-full w-full items-center justify-center text-sm font-medium">
                          {cell.count > 0 ? cell.count : '—'}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">0</span>
        <span className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">1-30%</span>
        <span className="flex items-center gap-1.5 px-2 py-1 bg-green-300 dark:bg-green-600 rounded">30-60%</span>
        <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-400 dark:bg-yellow-500 rounded">60-80%</span>
        <span className="flex items-center gap-1.5 px-2 py-1 bg-red-400 dark:bg-red-500 rounded">80-100%</span>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 id="modal-title" className="text-lg font-semibold mb-4 flex items-center justify-between">
              <span>{DAY_LABELS[modal.day]} {formatHour(modal.hour)}</span>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allNames.map(name => {
                const isAvailable = modal.cell.available.includes(name);
                return (
                  <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold', isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}>
                      {isAvailable ? '✓' : '✕'}
                    </span>
                    <span className={clsx('font-medium', isAvailable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300')}>
                      {name}
                    </span>
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      {isAvailable ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <strong>{modal.cell.available.length}</strong> de <strong>{allNames.length}</strong> personas disponibles
            </div>
          </div>
        </div>
      )}
    </>
  );
}