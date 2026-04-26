# Taste Francesinhas — Frontend

Frontend del TFM (UOC, 2025/2). Aplicación web **PWA** construida con **Angular 21** que consume la API REST `taste_franceseinhas_backend`.

> Necesita el backend arrancado para funcionar.

---

## Stack

| Tecnología       | Versión / Detalle                                    |
|------------------|------------------------------------------------------|
| Angular          | 21 (standalone components, sin NgModules)            |
| TypeScript       | ~5.9                                                 |
| Estilos          | Tailwind CSS v4 con tokens en `@theme`               |
| UI               | Angular Material 21 + Material Symbols Outlined      |
| Estado           | Signals (`signal`, `computed`, `effect`) — sin NgRx  |
| HTTP             | `HttpClient` + interceptor JWT                       |
| Formularios      | Reactive Forms                                       |
| PWA              | `@angular/service-worker` (caché offline)            |
| Tests            | Vitest                                               |
| Deploy           | Netlify                                              |

---

## Requisitos previos

- **Node.js** ≥ 20.11 (recomendado 22 LTS)
- **npm** ≥ 10 (incluido con Node)
- Backend arrancado en `http://localhost:8082/tastefrancesinhas` (ver README del backend)

> **No** hace falta instalar Angular CLI globalmente: usa `npx`.

---

## Instalación rápida (3 pasos)

### 1. Clonar el repo e instalar dependencias

```bash
git clone <url-del-repo>
cd taste_francesinhas_frontend
npm install
```

### 2. Configurar el entorno

Edita `src/environments/environment.ts` si tu backend corre en otro host/puerto:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082/tastefrancesinhas'
};
```

> El fichero `environment.prod.ts` apunta a Railway y se sustituye automáticamente al hacer `ng build`.

### 3. Arrancar el dev server

```bash
npm start
```

App disponible en: **http://localhost:4200**

Recarga automática con cada cambio.

---

## Scripts disponibles

| Script             | Descripción                                                        |
|--------------------|--------------------------------------------------------------------|
| `npm start`        | Dev server en `http://localhost:4200` (HMR activo)                 |
| `npm run build`    | Build de producción optimizado en `dist/`                          |
| `npm run watch`    | Build de desarrollo con watch mode                                 |
| `npm test`         | Tests unitarios con Vitest                                         |

---

## Estructura del código

```
src/
|__ app/
|   |__ core/                # Servicios, guards, interceptors, modelos
|   |   |__ guards/          # authGuard, adminGuard, userGuard
|   |   |__ interceptors/    # authInterceptor (JWT + manejo de 401)
|   |   |__ models/          # Tipos de DTO
|   |   |__ services/        # AuthService, FrancesinhaService, ...
|   |__ features/            # Pantallas por dominio
|   |   |__ admin/
|   |   |__ auth/
|   |   |__ francesinhas/
|   |   |__ ...
|   |__ shared/              # Componentes reutilizables (toast, navbar, ...)
|   |__ app.config.ts        # Providers raíz (router, http, service worker)
|   |__ app.routes.ts        # Definición de rutas
|   |__ app.ts               # Bootstrap + MatIconRegistry
|__ environments/            # environment.ts / environment.prod.ts
|__ styles.css               # Tailwind + tokens @theme + overrides Material
|__ index.html
```

---

## Autenticación

- Tras `login` / `signup`, el `AuthService` guarda en un signal el `LoginResponse` (`accessToken`, `refreshToken`, `name`, `email`, `role`).
- Un `effect()` sincroniza ese signal con `localStorage` (clave `auth`).
- El `authInterceptor` añade `Authorization: Bearer <token>` a cada request.
- Si el backend responde **401**, el interceptor llama a `auth.logout()` y redirige a `/auth/login`.
- Guards: `authGuard` (logueado), `adminGuard` (rol ADMIN), `userGuard` (rol USER).

---

## Rutas implementadas

| Ruta                   | Componente                  | Auth   |
|------------------------|-----------------------------|--------|
| `/francesinhas`        | Listado público             | —      |
| `/francesinhas/:id`    | Detalle francesinha         | —      |
| `/restaurants`         | Listado restaurantes        | —      |
| `/restaurants/:id`     | Detalle restaurante         | —      |
| `/auth/login`          | Login                       | —      |
| `/auth/register`       | Registro                    | —      |
| `/propose`             | Proponer francesinha        | USER   |
| `/favorites`           | Mis favoritos               | USER   |
| `/profile`             | Perfil de usuario           | logueado |
| `/admin`               | Panel de moderación         | ADMIN  |

---

## Tema y estilos

Tokens definidos en `src/styles.css` dentro del bloque `@theme`:

```css
@theme {
  --color-primary:   #C45C2A;   /* naranja tostado */
  --color-secondary: #8B3820;   /* marrón oscuro   */
  --color-accent:    #F5C4B3;   /* melocotón claro */
  --color-neutral:   #F1EFE8;   /* fondo crema     */
  --color-tertiary:  #ffdfa0;   /* amarillo cálido */
  --color-success:   #1a7a3c;
  --color-warning:   #a16207;
  --color-danger:    #e11d48;
  ...
}
```

Tailwind v4 genera automáticamente las clases (`bg-primary`, `text-danger`, etc.) a partir de las variables.

---

## PWA

- Service Worker registrado en `app.config.ts` con `registrationStrategy: 'registerWhenStable:30000'`.
- Configuración de caché en `ngsw-config.json` (asset groups `app` prefetch + `assets` lazy).
- Solo activo en build de **producción** (`!isDevMode()`), no en dev server.

Para probar el SW localmente:

```bash
npm run build
npx http-server -p 4200 -c-1 dist/taste-francesinhas-frontend/browser
```

---

## Deploy

### Netlify

El fichero `netlify.toml` ya está configurado:

- Build: `npm run build`
- Publish dir: `dist/taste-francesinhas-frontend/browser`
- Redirects SPA: todo `/*` → `/index.html` (status 200)

Pasos:
1. Conectar el repo a Netlify.
2. Variables de entorno: ninguna obligatoria (la URL de la API ya está en `environment.prod.ts`).
3. Deploy.

---

## Troubleshooting

| Síntoma                                            | Causa                                       | Solución                                       |
|----------------------------------------------------|---------------------------------------------|------------------------------------------------|
| `CORS error` al llamar a la API                    | `ALLOWED_ORIGINS` del backend no incluye `http://localhost:4200` | Editar la variable de entorno del backend      |
| 401 en bucle, redirección constante a login       | Token caducado o `JWT_SECRET` cambió        | Hacer logout manual y volver a entrar          |
| `Cannot find module 'tailwindcss'`                 | `npm install` no se completó                | `rm -rf node_modules && npm install`           |
| Iconos no se ven (cuadraditos)                     | No se cargó `material-symbols/outlined.css` | Verificar el `@import` en `src/styles.css`     |
| El SW se queda con una versión vieja               | Caché del navegador                         | DevTools → Application → Service Workers → Unregister |

---

## Convenciones de código

- **Standalone components** siempre. Nada de `NgModule`.
- **Signals** para estado local y compartido (`signal`, `computed`, `effect`). Nada de RxJS Subjects para estado.
- **Reactive Forms**, nunca template-driven.
- **Lombok del frontend**: cada componente nuevo trae su `.scss` (aunque esté vacío) referenciado con `styleUrl`.
- IntersectionObserver en Angular 21: usar `viewChild.required<ElementRef>()` + `effect((onCleanup) => ...)`. Nunca `@ViewChild` + `ngAfterViewInit`.
