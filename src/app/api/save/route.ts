import { NextRequest, NextResponse } from 'next/server';
import { saveAvailability } from '@/lib/kv';
import { PersonAvailability } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, availability } = body as { name: string; availability: PersonAvailability };
    
    if (!name || !availability) {
      return NextResponse.json({ error: 'Nombre y disponibilidad requeridos' }, { status: 400 });
    }
    
    await saveAvailability(name.trim(), availability);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving availability:', error);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}