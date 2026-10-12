'use client';

import { useState, useCallback } from 'react';
import { PersonAvailability, DayKey, HOURS, DAYS } from '@/lib/types';
import { emptyAvailability } from '@/lib/utils';

export function useAvailability(initialName: string) {
  const [availability, setAvailability] = useState<PersonAvailability>(() => emptyAvailability());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const toggleHour = useCallback((day: DayKey, hour: number) => {
    setAvailability(prev => {
      const current = prev[day] || [];
      const exists = current.includes(hour);
      return {
        ...prev,
        [day]: exists ? current.filter(h => h !== hour) : [...current, hour].sort((a, b) => a - b)
      };
    });
    setSaved(false);
  }, []);

  const toggleRange = useCallback((day: DayKey, startHour: number, endHour: number) => {
    setAvailability(prev => {
      const current = prev[day] || [];
      const newHours = [...current];
      for (let h = startHour; h <= endHour; h++) {
        if (!newHours.includes(h)) newHours.push(h);
      }
      return { ...prev, [day]: newHours.sort((a, b) => a - b) };
    });
    setSaved(false);
  }, []);

  const clearDay = useCallback((day: DayKey) => {
    setAvailability(prev => ({ ...prev, [day]: [] }));
    setSaved(false);
  }, []);

  const clearAll = useCallback(() => {
    setAvailability(emptyAvailability());
    setSaved(false);
  }, []);

  const save = useCallback(async (name: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), availability })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  }, [availability]);

  const hasAnySelection = Object.values(availability).some(arr => arr.length > 0);

  return {
    availability,
    setAvailability,
    toggleHour,
    toggleRange,
    clearDay,
    clearAll,
    save,
    saving,
    error,
    saved,
    hasAnySelection
  };
}