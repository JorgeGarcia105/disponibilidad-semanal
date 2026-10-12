import { kv } from '@vercel/kv';
import { getAvailabilityKey, getWeekKey, emptyAvailability } from './utils';
import { AllAvailability, PersonAvailability } from './types';

function hasKVConfig(): boolean {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
}

export async function saveAvailability(name: string, data: PersonAvailability): Promise<void> {
  if (!hasKVConfig()) return;
  const weekKey = getWeekKey();
  const key = getAvailabilityKey(weekKey);
  await kv.hset(key, { [name]: JSON.stringify(data) });
}

export async function loadAvailability(): Promise<AllAvailability> {
  if (!hasKVConfig()) return {};
  try {
    const weekKey = getWeekKey();
    const key = getAvailabilityKey(weekKey);
    const data = await kv.hgetall<Record<string, string>>(key);
    
    if (!data) return {};
    
    const result: AllAvailability = {};
    Object.entries(data).forEach(([name, json]) => {
      try {
        const parsed = JSON.parse(json);
        const normalized: PersonAvailability = emptyAvailability();
        Object.entries(parsed).forEach(([day, hours]) => {
          if (day in normalized) {
            normalized[day as keyof PersonAvailability] = Array.isArray(hours) ? hours : [];
          }
        });
        result[name] = normalized;
      } catch {
        result[name] = emptyAvailability();
      }
    });
    return result;
  } catch {
    return {};
  }
}

export async function deleteAvailability(name: string): Promise<void> {
  if (!hasKVConfig()) return;
  const weekKey = getWeekKey();
  const key = getAvailabilityKey(weekKey);
  await kv.hdel(key, name);
}

export async function clearWeek(): Promise<void> {
  if (!hasKVConfig()) return;
  const weekKey = getWeekKey();
  const key = getAvailabilityKey(weekKey);
  await kv.del(key);
}