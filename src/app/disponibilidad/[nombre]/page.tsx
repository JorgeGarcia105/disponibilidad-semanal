'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WeekGrid } from '@/components/WeekGrid';
import { Button } from '@/components/ui/Button';
import { useAvailability } from '@/hooks/useAvailability';
import { getWeekKey, formatWeekRange } from '@/lib/utils';
import { DAYS } from '@/lib/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function DisponibilidadPage() {
  const params = useParams();
  const name = decodeURIComponent(params.nombre as string);
  const weekKey = getWeekKey();
  const weekRange = formatWeekRange(weekKey);

  const {
    availability,
    toggleHour,
    toggleRange,
    clearDay,
    clearAll,
    save,
    saving,
    error,
    saved,
    hasAnySelection
  } = useAvailability(name);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(`availability-${weekKey}-${name}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const normalized: Record<string, number[]> = {};
        DAYS.forEach(day => normalized[day] = parsed[day] || []);
        // We can't directly set state here since useAvailability manages it internally
        // The hook will use its own initial state
      } catch {}
    }
  }, [name, weekKey]);

  const handleSave = async () => {
    await save(name);
    if (!error) {
      localStorage.setItem(`availability-${weekKey}-${name}`, JSON.stringify(availability));
    }
  };

  const handleClearAll = () => {
    clearAll();
    localStorage.removeItem(`availability-${weekKey}-${name}`);
    setShowClearConfirm(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Disponibilidad de {name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Semana del {weekRange} · 8:00–22:00
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/resultado" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                Ver resultado
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(true)}>
                Limpiar todo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <WeekGrid
          availability={availability}
          onToggleHour={toggleHour}
          onToggleRange={toggleRange}
          readOnly={false}
        />

        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <Button
                key={day}
                variant="ghost"
                size="sm"
                onClick={() => clearDay(day)}
                disabled={!availability[day]?.length}
              >
                Limpiar {day.charAt(0).toUpperCase() + day.slice(1)}
              </Button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={saving || !hasAnySelection}
              className="min-w-[140px]"
            >
              {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar disponibilidad'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {saved && !saving && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
            Disponibilidad guardada correctamente ✓
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>💡 Pista: Arrastra sobre las celdas para seleccionar rangos de horas</p>
          <p>📱 En móvil: Mantén pulsado y arrastra</p>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowClearConfirm(false)} role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">¿Limpiar toda la disponibilidad?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Se borrarán todas las horas marcadas. Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>Cancelar</Button>
              <Button variant="danger" onClick={handleClearAll}>Sí, limpiar todo</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}