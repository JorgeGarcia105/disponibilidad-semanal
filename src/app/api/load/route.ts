import { NextResponse } from 'next/server';
import { loadAvailability } from '@/lib/kv';
import { computeHeatmap } from '@/lib/utils';

export async function GET() {
  try {
    const data = await loadAvailability();
    const heatmap = computeHeatmap(data);
    return NextResponse.json({ data, heatmap });
  } catch (error) {
    console.error('Error loading availability:', error);
    return NextResponse.json({ error: 'Error al cargar' }, { status: 500 });
  }
}