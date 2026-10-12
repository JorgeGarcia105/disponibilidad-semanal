'use client';

import { useState, useEffect } from 'react';
import { NameForm } from '@/components/NameForm';
import { getWeekKey, formatWeekRange } from '@/lib/utils';

export default function HomePage() {
  const [step, setStep] = useState<'name' | 'loading'>('name');
  const [weekRange, setWeekRange] = useState('');

  useEffect(() => {
    const key = getWeekKey();
    setWeekRange(formatWeekRange(key));
  }, []);

  const handleNameSubmit = (name: string) => {
    setStep('loading');
    window.location.href = `/disponibilidad/${encodeURIComponent(name)}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Disponibilidad Semanal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Semana del {weekRange || 'cargando...'}
          </p>
        </div>

        {step === 'name' ? (
          <NameForm onSubmit={handleNameSubmit} />
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 mb-4">
              <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-lg font-medium">Redirigiendo...</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Si no redirige automáticamente, <a href={`/disponibilidad/${encodeURIComponent('')}`} className="underline">haz clic aquí</a>
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500 space-y-1">
          <p>Horario: 8:00 – 22:00</p>
          <p>Días: Lunes 12 – Domingo 18</p>
          <p>Arrastra o pulsa para marcar horas</p>
        </div>
      </div>
    </main>
  );
}