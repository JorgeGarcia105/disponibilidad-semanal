'use client';

import { useState, FormEvent } from 'react';
import { Button } from './ui/Button';

interface NameFormProps {
  onSubmit: (name: string) => void;
  disabled?: boolean;
}

export function NameForm({ onSubmit, disabled = false }: NameFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Por favor escribe tu nombre');
      return;
    }
    if (trimmed.length > 30) {
      setError('Nombre muy largo (máx. 30 caracteres)');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tu nombre
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
          disabled={disabled}
          className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="Ej: Juan"
          maxLength={30}
          autoComplete="off"
          autoFocus
        />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={disabled || !name.trim()}>
        Continuar
      </Button>
    </form>
  );
}