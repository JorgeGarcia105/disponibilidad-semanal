'use client';

import { useEffect, useState } from 'react';
import { Heatmap } from '@/components/Heatmap';
import { getWeekKey, formatWeekRange } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface HeatmapData {
  data: Record<string, Record<string, number[]>>;
  heatmap: Record<string, Record<number, { count: number; available: string[]; unavailable: string[] }>>;
}

export default function ResultadoPage() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekRange, setWeekRange] = useState('');

  useEffect(() => {
    const key = getWeekKey();
    setWeekRange(formatWeekRange(key));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/load');
        if (!res.ok) throw new Error('Error al cargar');
        const data = await res.json();
        setHeatmapData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const allNames = heatmapData ? Object.keys(heatmapData.data).sort() : [];

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 mb-4">
            <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-lg">Cargando disponibilidad...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Resultado combinado
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Semana del {weekRange} · {allNames.length} persona{allNames.length !== 1 ? 's' : ''} participando
              </p>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm">Nueva entrada</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <Heatmap heatmap={heatmapData?.heatmap as any} allNames={allNames} />

        {allNames.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Participantes</h2>
            <div className="flex flex-wrap gap-2">
              {allNames.map(name => (
                <span key={name} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Pulsa cualquier celda con número para ver quién está disponible</p>
          <p className="text-xs">Actualización automática cada 10 segundos</p>
        </div>
      </div>
    </main>
  );
}