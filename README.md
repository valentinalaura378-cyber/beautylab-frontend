# BeautyLab · Frontend

Aplicación Angular 21 (componentes standalone, signals y rutas con carga diferida).

```bash
npm install
npm start      # http://localhost:4200
npm run build  # versión de producción en dist/
```

La URL del backend se configura en `src/app/core/config.ts`.

## Páginas
`/` inicio · `/explorar` · `/categorias` · `/productos` · `/tutoriales/:id` · `/tutoriales/nuevo` ·
`/mi-aprendizaje` · `/mi-kit` · `/notificaciones` · `/perfil` · `/admin` · `/acceder`

Para desplegar en un hosting estático, configura la redirección de todas las rutas a `index.html`.
