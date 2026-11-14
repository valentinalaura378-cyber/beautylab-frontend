# 💄 BeautyLab — Plataforma web educativa de maquillaje

Proyecto de Investigación II · Escuela Tecnológica Instituto Técnico Central
Autoras: Alison Ximena García Cortés y Laura Valentina Rodríguez López

BeautyLab reúne en un solo espacio tutoriales paso a paso, técnicas, estilos y consejos de maquillaje,
y permite que los usuarios **aprendan** y también **compartan** sus propios tutoriales y experiencias.

Este repositorio **une los tres proyectos anteriores** en uno solo:

| Proyecto anterior | Qué aportó a BeautyLab |
|---|---|
| `backend-tasks` (proyectos, tareas, tags, comentarios, notificaciones, actividad) | Un *proyecto con tareas* pasó a ser un **tutorial con pasos**; además tags, comentarios, notificaciones y registro de actividad |
| `backend-makeup` (marcas, categorías, productos, inventario, reseñas) | **Categorías**, **marcas** y **productos recomendados** de cada tutorial; el *inventario* es ahora **Mi kit**; las *reseñas* son **valoraciones de tutoriales** |
| `makeup-app` (Angular) | Base del frontend: login, estilo rosa, páginas de catálogo (ahora con formularios reales en lugar de `prompt()`) |

## Estructura

```
beautylab/
├── backend/    API REST · Node.js + Express 5 + TypeScript + MongoDB + JWT + Swagger
└── frontend/   Aplicación web · Angular 21
```

## Cómo ejecutarlo

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # y completa MONGO_URI y JWT_SECRET
npm run seed              # (opcional) carga categorías, productos y tutoriales de ejemplo
npm run dev               # http://localhost:3000  ·  Swagger: /api/v1/docs
```

### 2. Frontend
```bash
cd frontend
npm install
npm start                 # http://localhost:4200
```
Si el backend no está en `http://localhost:3000`, cambia `API_URL` en `frontend/src/app/core/config.ts`.

### Usuarios del seed
- Admin: `admin@beautylab.com` / `Admin123*`
- Demo: `alison@beautylab.com` y `laura@beautylab.com` / `Demo1234*`

(Cámbialos con las variables `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DEMO_PASSWORD` antes de publicar.)

## Funcionalidades (según el documento del proyecto)

| Objetivo del proyecto | Dónde está |
|---|---|
| Acceder a tutoriales organizados | Explorar (búsqueda, categoría, nivel, orden, paginación) y Categorías |
| Tutoriales paso a paso | Detalle del tutorial con pasos, consejos y productos recomendados |
| Aprender a su propio ritmo | Progreso por pasos, favoritos y "Mi aprendizaje" |
| Compartir tutoriales, consejos y experiencias | Crear / editar tutoriales (borrador o publicado) |
| Aprendizaje colaborativo: comentar, opinar, resolver dudas | Comentarios con respuestas, valoraciones de 1 a 5, notificaciones |
| Evaluar la plataforma | Indicadores del proyecto: tutoriales consultados (vistas), participación (comentarios/valoraciones), actividad por usuario |
| Interfaz accesible y sencilla | Diseño responsive (celular y computador) |

## Módulos del backend

`auth` · `users` · `categories` · `brands` · `products` · `tags` · `tutorials` · `comments` · `reviews` ·
`progress` · `favorites` · `kit` · `notifications` · `activity-logs` · `stats`

Cada módulo sigue la misma arquitectura de sus proyectos anteriores: *routes → controller → service → repository → model*.

## ⚠️ Seguridad

El `README` del proyecto `backend-tasks` original tenía **la cadena de conexión de MongoDB Atlas con usuario y contraseña**
escritos en texto. Como esa información estuvo en el repositorio, **cambien la contraseña de ese usuario en MongoDB Atlas**
y no la vuelvan a subir. En BeautyLab las credenciales solo van en `.env` (que está en `.gitignore`).
