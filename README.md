# Disponibilidad Semanal

App para que un grupo marque su disponibilidad horaria (Lun-Dom, 8:00-22:00) y vea el resultado combinado en un mapa de calor.

## Stack
- **Next.js 16** (App Router, Turbopack)
- **React 19** + TypeScript
- **Tailwind CSS 4**
- **Vercel KV** (Redis) para persistencia
- **date-fns** para manejo de fechas

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Vercel KV

# Desarrollo
npm run dev
```

Abre http://localhost:3000

## Despliegue en Vercel (recomendado)

### 1. Crear base de datos KV
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard) → Storage
2. Create Database → KV
3. Copia `KV_REST_API_URL` y `KV_REST_API_TOKEN`

### 2. Desplegar
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login y link
vercel login
vercel link

# Añadir variables de entorno
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN

# Deploy a producción
vercel deploy --prod
```

### 3. Variables de entorno necesarias
| Variable | Descripción |
|----------|-------------|
| `KV_REST_API_URL` | URL de la base de datos KV (ej: `https://xxx.kv.vercel-storage.com`) |
| `KV_REST_API_TOKEN` | Token de acceso (ej: `xxxxxxxxxxxxxxxx`) |

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── save/route.ts      # POST - guarda disponibilidad
│   │   └── load/route.ts      # GET - carga todas las disponibilidades
│   ├── disponibilidad/
│   │   └── [nombre]/
│   │       └── page.tsx       # Grid interactivo (cliente)
│   ├── resultado/
│   │   └── page.tsx           # Heatmap combinado (cliente)
│   ├── layout.tsx
│   ├── page.tsx               # Landing + formulario nombre
│   └── globals.css
├── components/
│   ├── WeekGrid.tsx           # Grid 7×15 con drag/touch
│   ├── Heatmap.tsx            # Mapa de calor con modal
│   ├── NameForm.tsx           # Formulario inicial
│   └── ui/Button.tsx
├── hooks/
│   └── useAvailability.ts     # Estado + guardado
└── lib/
    ├── kv.ts                  # Cliente Vercel KV
    ├── utils.ts               # Helpers (semana ISO, heatmap)
    └── types.ts               # Tipos TypeScript
```

## Flujo de usuario
1. **`/`** → Escribe nombre → `Continuar`
2. **`/disponibilidad/Nombre`** → Marca horas (click/drag) → `Guardar`
3. **`/resultado`** → Ve heatmap combinado, click en celda → modal con ✅/❌

## Características
- ✅ Grid 7 días × 15 horas (8:00-22:00)
- ✅ Drag para seleccionar rangos (mouse + touch)
- ✅ Persistencia en Vercel KV (Redis)
- ✅ Heatmap codificado por color (0→gris, bajo→verde, alto→rojo)
- ✅ Modal al click con lista de ✅ disponibles / ❌ no disponibles
- ✅ Dark mode automático
- ✅ Responsive (móvil/desktop)
- ✅ PWA ready (manifest.json)
- ✅ Actualización automática cada 10s en `/resultado`
- ✅ Datos por semana ISO (se renuevan cada lunes)

## Costes estimados (Vercel Hobby)
- **$0/mes** - KV incluido (30M requests/mes gratis)
- Suficiente para ~50 usuarios/semana

## Personalización
- Horario: edita `HOURS` en `src/lib/types.ts`
- Días: edita `DAYS` en `src/lib/types.ts`
- Colores heatmap: edita `getColorClass` en `src/components/Heatmap.tsx`
- Semana actual: usa `getWeekKey()` en `src/lib/utils.ts`