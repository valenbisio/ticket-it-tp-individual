# AI Ticket It

Plataforma para publicar eventos y vender entradas, con dos roles: **organizadores** que crean eventos y gestionan compras, y **compradores** que buscan eventos, compran entradas, cancelan, chatean y califican. Es el Trabajo Práctico Individual de DDS (UTN FRBA) y se ejecuta de forma local con persistencia en memoria.

## Stack

- **Lenguaje:** JavaScript moderno con ESM en ambos módulos. El backend usa `.js`; el frontend usa **JavaScript + JSX** (`.jsx`), no TypeScript.
- **Framework / runtime:** Node.js + Express 5 (backend) y React Native 0.88 + Expo SDK 58 + Expo Router (frontend).
- **Base de datos:** No hay base de datos. Persistencia **en memoria** mediante repositorios y datos semilla (`packages/backend/src/data/seed.js`).
- **Tests:** `node:test` + `node:assert` (solo backend). El frontend no tiene tests configurados.
- **Validación:** Zod 4, a través de los middlewares de `packages/backend/src/middlewares/`.
- **Estilos (frontend):** `StyleSheet.create` de React Native + tokens de diseño en `src/data/theme.js` (`colors`, `spacing`, `borderRadius`). No hay Tailwind activo en la app.
- **Documentación de API:** Swagger UI en `/api-docs` y especificación en `/api-docs.json`.

## Comandos

Ejecutar desde la raíz del repo salvo que se indique otra cosa.

- `npm run setup` — instala dependencias del backend y del frontend.
- `npm run start:dev` — arranca backend y frontend en paralelo.
- `npm run dev:backend` — backend en modo watch (`http://localhost:8000`).
- `npm run start:frontend` — Metro/Expo; permite abrir la app en Expo Go, emulador o web.
- `npm test --workspace=backend` — ejecuta los tests del backend (deben pasar antes de cada commit).
- `npm run lint` — ESLint sobre todo el repo (antes de cada PR).
- `npm run lint --prefix packages/frontend` — lint del frontend con `expo lint`. No hay typecheck: el código es JSX.
- `cd packages/frontend; npx expo-doctor` — diagnostica dependencias y configuración de Expo.
- `npx expo export` — desde `packages/frontend`, genera el bundle de producción. No hay script `build` en la raíz.
- `npm run format` — Prettier sobre el repo.

Atajos útiles: `npm start --workspace=backend` y `npm start --prefix packages/frontend`.

## Estructura del proyecto

- `packages/backend/` — API Express. Punto de entrada `index.js`; configuración de la app en `src/app.js`.
  - `src/models/` — entidades del dominio (`Evento`, `TipoEntrada`, `Compra`, `EstadoCompra`, `Mensaje`, `Resenia`, `Usuario`, `Categoria`, `CambioEstadoCompra`).
  - `src/repositories/` — acceso a las colecciones en memoria (`EventoRepository`, `CompraRepository`, `CategoriaRepository`).
  - `src/services/` — reglas de negocio (`EventoService`, `CompraService`).
  - `src/controllers/` — adaptación HTTP; no deben contener reglas de negocio.
  - `src/routes/` — definición de endpoints y composición de dependencias.
  - `src/schemas/` — esquemas Zod de entrada (`evento`, `compra`, `mensaje`, `resenia`, `busquedaEvento`).
  - `src/middlewares/` — validación, manejo y logging de errores, 404 y rate limiting.
  - `src/serializers/` — transformación de entidades al contrato JSON de la API.
  - `src/errors/` — errores propios (`AppError`, `BadRequestError`, `NotFoundError`, `ConflictError`, `UnprocessableEntityError`).
  - `src/data/seed.js` — datos demo y repositorio de compras compartido.
  - `src/utils/fechas.js` — cálculo de días entre fechas.
  - `test/` — tests de dominio, servicios y casos de uso.
- `packages/frontend/` — app móvil Expo (React Native + Expo Router, JavaScript/JSX).
  - `src/app/` — **rutas de Expo Router**. Cada archivo es una ruta y los `_layout.jsx` definen los navegadores. Los archivos de ruta son wrappers finos que renderizan una pantalla de `src/screens/`.
    - `index.jsx` — selección de rol (comprador u organizador).
    - `_layout.jsx` — `Stack` raíz + `AppProvider` global.
    - `(buyer)/` — grupo de rutas del comprador: `_layout.jsx`, `explore.jsx`, `purchases.jsx`, `event/[id].jsx`, `chat/[id].jsx`, `rate/[id].jsx`.
    - `(organizer)/` — grupo de rutas del organizador: `_layout.jsx`, `events.jsx`, `create.jsx`, `event/[id].jsx`.
  - `src/screens/` — implementación real de cada pantalla (`RoleSelectScreen`, `ExploreEventsScreen`, `EventDetailScreen`, `MyPurchasesScreen`, `PurchaseChatScreen`, `RateEventScreen`, `OrganizerEventsScreen`, `OrganizerEventDetailScreen`, `CreateEventScreen`). Acá va la UI y la interacción; la navegación se hace con `expo-router`.
  - `src/components/common/` — componentes reutilizables de UI (`Header`, `BottomTabBar`, `StatusBadge`, `DynamicQRModal`).
  - `src/contexts/` — estado global con React Context.
    - `AppContext.jsx` — `AppProvider`/`useApp`: usuarios, rol actual, eventos, compras, chats, reseñas, favoritos, toasts y modal QR, junto con las acciones sobre ese estado en memoria.
    - `auth-context.jsx` — `AuthProvider`/`useAuth` contra los endpoints `/auth` del backend; todavía no está montado en el layout raíz.
  - `src/data/` — datos y diseño.
    - `initialData.js` — datos semilla del frontend (usuarios, eventos, compras, chats, reseñas).
    - `theme.js` — tokens de diseño (`colors`, `spacing`, `borderRadius`).
  - `src/hooks/` — hooks de apoyo (`useEvents`, `usePurchases`, `useChat`, `useReviews`); envuelven `AppContext` o la capa de servicios.
  - `src/utils/` — helpers de dominio del frontend (`purchases.js`: días hasta el evento, etiqueta de días y reglas de cancelación).
  - `src/services/` — capa destinada a las llamadas HTTP del frontend. Hoy está vacía: varias pantallas y hooks importan `../services/api.js`, que falta implementar.
  - `src/App.jsx` y `src/index.css` — restos del prototipo web anterior (router propio por `currentScreen` y Tailwind). La app actual arranca con `expo-router/entry`; no se usan.
  - `assets/` — imágenes, iconos y splash.
  - `app.json` — configuración de Expo. `tsconfig.json` — configuración de tooling y alias `@/*` (no aplica typecheck a `.jsx`).
- `packages/frontend/AGENTS.md` — reglas específicas de Expo/React Native. Leerlo antes de trabajar en el frontend.
- `eslint.config.mjs` — configuración compartida de ESLint.
- `README.md` — contexto, casos de uso e instrucciones de arranque.

## Flujos principales

> Estos flujos describen el comportamiento esperado según el enunciado del TP y son la referencia funcional del proyecto. Si el código actual no los cumple, hay que corregir el código; no se debe reinterpretar el flujo para que coincida con la implementación.

### 1. Visualización de compras (comprador)

- El comprador visualiza todas sus compras.
- Diferencia con claridad el estado en el que se encuentra cada una.
- Si la compra está confirmada, ve cuántos días faltan para el evento.

### 2. Visualización de compras por evento (organizador)

- El organizador visualiza las compras asociadas a un evento en particular.
- Diferencia con claridad el estado de cada compra.
- Ve cuántas entradas quedan disponibles de cada tipo.

### 3. Búsqueda y exploración de eventos (comprador)

- El comprador busca eventos de forma específica mediante una búsqueda textual.
- También puede explorar los eventos por categorías.

### 4. Creación de eventos (organizador)

- El organizador crea un evento con su descripción, fecha de realización, material multimedia y categoría.
- Define distintos tipos de entrada, cada uno con su precio y cupo, para adaptarse a diferentes públicos y presupuestos.

### 5. Envío de mensajes (comprador)

- El comprador envía mensajes en cualquier momento relacionados con una compra, mediante un chat dentro de la misma.

### 6. Respuesta de mensajes (organizador)

- El organizador responde mensajes en cualquier momento relacionados con una compra, mediante un chat dentro de la misma.

### 7. Cancelación de compra (comprador)

- El comprador cancela una compra para obtener el reembolso en caso de no poder asistir al evento.

### 8. Reglas de cancelación (organizador)

- Los compradores pueden cancelar una compra siempre que la misma no se encuentre en estado utilizada y el evento aún no se haya realizado.

### 9. Calificación del evento (organizador)

- Una vez utilizada una entrada, el comprador puede puntuar el evento de forma numérica y dejar un comentario escrito.

### 10. Visualización de reseñas (comprador)

- Las reseñas de eventos anteriores se visualizan en los eventos de cada organizador, para conocer experiencias previas antes de comprar.

### 11. Ordenamiento de eventos (comprador)

- Al buscar eventos, el comprador puede ordenarlos por precio, fecha del evento y puntaje del organizador.

### 12. Compra de entradas (comprador)

- El comprador realiza una compra sobre un evento seleccionando uno de los tipos de entrada disponibles y la cantidad deseada.
- La cantidad no puede superar el cupo disponible.

## Estados de una compra

Una compra atraviesa distintas etapas que reflejan su situación:

- **Pendiente de pago:** la compra fue iniciada pero aún no está confirmada.
- **Confirmada:** la compra está paga y el comprador tiene acceso al evento; se muestran los días restantes.
- **Utilizada:** la entrada ya fue utilizada en el evento y habilita la calificación.
- **Cancelada:** el comprador canceló la compra antes del evento.
- **Reembolsada:** la compra fue cancelada y se realizó el reembolso correspondiente.

## Convenciones

- **Backend:** ESM (`import`/`export`), clases en `PascalCase`, funciones y variables en `camelCase`, archivos de clases en `PascalCase.js` y el resto en `camelCase.js`. Incluir siempre la extensión `.js` en imports relativos.
- **Capas:** respetar `route → controller → service → repository → model`. Las reglas de negocio van en services; los controllers solo traducen HTTP; los repositorios solo acceden a datos.
- **Validación:** toda entrada del usuario se valida con Zod en `src/schemas/` y los middlewares `validarSchema` / `validarQuerySchema`. No validar a mano dentro de los controllers.
- **Errores:** lanzar las clases de `src/errors/` (`BadRequestError` 400, `NotFoundError` 404, `ConflictError` 409, `UnprocessableEntityError` 422). El `errorHandler` centraliza la respuesta.
- **Estados y fechas:** usar `EstadoCompra`; usar `src/utils/fechas.js` para cálculos de días. No comparar fechas con lógica ad hoc.
- **Respuestas:** serializar con `src/serializers/` para mantener estable el contrato JSON. No devolver entidades crudas con referencias circulares.
- **Tests:** van en `packages/backend/test/` con sufijo `.test.js`; usar `node:test` y `node:assert`. Nombrar los casos en español y cubrir reglas de negocio, no detalles de implementación.
- **Frontend:** JavaScript + JSX, componentes funcionales y exports nombrados (las rutas de `src/app/` usan `export default`). Usar imports relativos con extensión (`../screens/ExploreEventsScreen.jsx`). No crear `.ts`/`.tsx`.
- **Frontend – estructura:** las rutas van en `src/app/` y solo renderizan pantallas; la UI completa va en `src/screens/`; lo compartido en `src/components/`, `src/hooks/`, `src/contexts/`, `src/utils/` y `src/services/`.
- **Frontend – navegación:** usar Expo Router (`useRouter`, `router.push`, `router.back`, `useLocalSearchParams`) y los grupos `(buyer)` / `(organizer)`. No reintroducir el router manual por `currentScreen`.
- **Frontend – estado:** el estado compartido vive en `AppContext` y se consume con `useApp()`; el estado local de una pantalla con `useState`.
- **Frontend – datos:** centralizar llamadas HTTP en `src/services/`; no hacer `fetch` directo desde pantallas. La URL base sale de `EXPO_PUBLIC_API_URL` y por defecto es `http://localhost:8000`.
- **Frontend – UI:** textos de interfaz en español; estilos con `StyleSheet.create` y los tokens de `src/data/theme.js` (`colors`, `spacing`, `borderRadius`). No hardcodear colores ni espaciados.
- **Frontend – Expo:** para agregar dependencias nativas usar `npx expo install`, nunca `npm install` directo. Leer la documentación de la versión de Expo instalada (SDK 58) antes de usar APIs nuevas.

## No hagas

- No instales dependencias nuevas sin avisar y justificar por qué.
- No reemplaces la persistencia en memoria por una base de datos real; el TP lo prohíbe.
- No subas archivos `.env` ni secretos al repositorio. Usá `.env.example` como referencia.
- No edites `node_modules/` ni las carpetas generadas `ios/` y `android/` (si existen, se generan con Expo CNG).
- No agregues archivos `.ts`/`.tsx` ni uses TypeScript en el frontend: el código es JSX.
- No hardcodees estados de compra, IDs de usuario, URLs de API, colores ni espaciados fuera de `theme.js`.
- No uses `src/App.jsx` ni `src/index.css` como referencia: son restos del prototipo anterior y no participan del arranque con Expo Router.
- No pongas lógica de negocio en controllers, rutas o componentes de React.
- No cambies el contrato de la API ni el puerto por defecto (`8000`) sin actualizar frontend, README y Swagger.
- No rompas la capa de servicios del frontend haciendo `fetch` desde una pantalla.
- No elimines ni modifiques los datos semilla sin confirmarlo: los tests y la demo dependen de ellos.
- No modifiques la descripción de los flujos para que coincida con la implementación actual: los flujos son el contrato funcional del TP y el código debe adaptarse a ellos.
- No montes autenticación real en el frontend ni reemplaces los usuarios demo sin que se pida: el backend ya expone `/auth`, pero la app sigue usando `juan` (comprador) y `salanorte` (organizador); en el backend los IDs demo son `usuario-1` y `usuario-2`.

## Deuda técnica conocida

- `src/routes/EventosRoute.js` instancia sus propios repositorios, mientras que `src/routes/UsuariosRoute.js` usa el `compraRepository` del seed. Esto puede provocar estados separados entre eventos y compras. Al agregar funcionalidad, unificar la composición de dependencias y compartir los repositorios desde un único punto.
- `src/services/` está vacío: `useChat`, `useReviews` y varias pantallas (`CreateEventScreen`, `OrganizerEventDetailScreen`, `PurchaseChatScreen`, `RateEventScreen`) importan `../services/api.js`, que no existe. Falta implementar la capa HTTP.
- `useEvents` y `usePurchases` esperan métodos de `AppContext` que hoy no existen (`loadEvents`, `loadPurchases`, `buyTicket`, `markPurchaseUsed`, `cancelPurchase`, `setActiveQR`); las pantallas usan los nombres actuales (`cancelAndRefundPurchase`, `qrModalPurchase`, etc.). Unificar el contrato.
- `src/App.jsx` e `src/index.css` son restos del prototipo web con router propio y Tailwind; no participan del arranque de Expo Router.
- `auth-context.jsx` no está montado en `src/app/_layout.jsx`. El backend ya expone `/auth`, pero el frontend sigue trabajando con los usuarios demo `juan` (comprador) y `salanorte` (organizador).
- No hay tests de frontend ni script raíz de build/typecheck (el frontend es JSX).

## Flujo de trabajo

- Antes de una tarea no trivial, proponé un plan y esperá mi OK.
- Una tarea a la vez; al terminar, decime qué cambiaste para que lo revise.
- Si no estás seguro al 80%, preguntá. No inventes.
- Después de cambios en el backend, ejecutá `npm test --workspace=backend`.
- Después de cambios en el frontend, ejecutá `npm run lint --prefix packages/frontend` (o `npm run lint` en la raíz, que también cubre `src/**/*.jsx`). No hay typecheck porque el código es JSX.
- No hagas commits ni push sin que te lo pida explícitamente.

## Documentación

- `README.md` — contexto del TP, casos de uso, estructura y arranque.
- `packages/frontend/AGENTS.md` — reglas específicas de Expo, routing, EAS y dependencias nativas.
- Swagger local: `http://localhost:8000/api-docs` (con el backend corriendo).
- Especificación OpenAPI: `GET /api-docs.json`.
- Documentación de Expo: `https://docs.expo.dev/versions/v58.0.0/`.
- Documentación de Expo Router: `https://docs.expo.dev/router/introduction/`.
- Documentación de Express 5: `https://expressjs.com/`.
- Documentación de Zod 4: `https://zod.dev/`.
