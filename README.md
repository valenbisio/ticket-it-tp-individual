# AI Ticket It - Trabajo Práctico Individual (DDS - UTN FRBA)

Este repositorio contiene la solución para el **Trabajo Práctico Individual de Desarrollo con IA** de la materia **Desarrollo de Software (DDS)** de la carrera **Ingeniería en Sistemas de Información** de la **UTN FRBA**.

---

## 🎯 Objetivo del Trabajo

El objetivo de este trabajo práctico es brindar un espacio de experimentación intensiva con herramientas de Inteligencia Artificial aplicadas al desarrollo de software. Actualmente, el uso de IA se ha convertido en un factor clave para potenciar la productividad, acelerar ciclos de desarrollo y asistir en la resolución de problemas técnicos complejos.

Sin embargo, resulta fundamental comprender las implicancias de depender excesivamente de estas herramientas sin un adecuado criterio técnico. Por este motivo, el presente trabajo propone explorar el uso de Inteligencia Artificial como herramienta principal de desarrollo, promoviendo su utilización de manera intensiva pero consciente.

---

## 🌐 Contexto General

Durante los últimos años, la industria del entretenimiento en vivo creció de forma sostenida: recitales, obras de teatro, festivales, conferencias y eventos deportivos convocan cada vez a más público. Las personas buscan descubrir eventos y adquirir entradas de forma rápida y segura desde su teléfono, mientras que miles de productores independientes y salas eligen publicar sus eventos y gestionar ventas de manera autónoma.

**AI Ticket It** es una plataforma orientada a la publicación de eventos y la venta de entradas. 

### Roles y Funcionalidades Principales
- **Organizadores:** Pueden crear y gestionar eventos (descripciones, fecha, multimedia, tipos de entrada según ubicación, precio y cupo), visualizar compras asociadas, responder consultas mediante chat y gestionar políticas de cancelación.
- **Compradores:** Pueden explorar el catálogo de eventos, filtrar por categorías, buscar espectáculos, guardar favoritos, comprar entradas seleccionando tipo y cantidad (sin superar cupo), realizar seguimiento de compras, comunicarse mediante chat, cancelar compras (con reembolso bajo condiciones) y calificar eventos con puntaje y comentarios una vez utilizados.

---

## 📦 Estructura del Proyecto (Monorepo)

El proyecto está organizado como un monorepo gestionado con npm workspaces:

```
.
├── packages/
│   ├── backend/        # Servidor Express.js (Node.js) con persistencia en memoria y Swagger
│   └── frontend/       # Aplicación móvil construida con React Native y Expo (Expo Router)
├── package.json        # Configuración raíz del monorepo
├── README.md           # Documentación principal
└── .env.example        # Variables de entorno de ejemplo
```

---

## ⚙️ Requerimientos Técnicos

- **Módulo Back-End:** Desarrollado con Node.js + Express, con persistencia en memoria y documentación de API.
- **Módulo Front-End:** Desarrollado con React Native (Expo). Ejecutable de forma local en dispositivos móviles o emuladores.

---

## 📋 Casos de Uso Implementados

1. **Visualización de Compras (Comprador):** Ver compras diferenciando estados (pendiente de pago, confirmada, utilizada, cancelada, reembolsada) y días restantes para el evento.
2. **Gestión de Compras por Evento (Organizador):** Ver compras asociadas a un evento y cupos disponibles de cada tipo de entrada.
3. **Búsqueda y Exploración:** Búsqueda textual por nombre/descripción y filtrado por categorías de eventos.
4. **Creación de Eventos (Organizador):** Publicar eventos con múltiples tipos de entrada (precio y cupo).
5. **Chat de Compra:** Intercambio de mensajes entre comprador y organizador asociados a una compra.
6. **Cancelación y Reembolso:** Cancelación por parte del comprador o validada por el organizador según el estado y fecha del evento.
7. **Reseñas y Calificaciones:** Calificación numérica y comentarios por parte del asistente una vez utilizada la entrada, visibles en el perfil del organizador/evento.
8. **Ordenamiento:** Ordenar eventos por precio, fecha del evento y puntaje del organizador.
9. **Compra de Entradas:** Selección de tipo de entrada y cantidad, validando cupos disponibles.

---

## 🚀 Inicio Rápido

### 1. Instalación de Dependencias

Desde la raíz del monorepo, ejecutá:

```bash
npm run setup
# O bien:
npm install
npm install --prefix packages/frontend
```

### 2. Configuración de Variables de Entorno

Creá un archivo `.env` en `packages/backend` basándote en `.env.example`:

```env
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:3000,http://127.0.0.1:3000
SERVER_PORT=3001
```

### 3. Ejecución de la Aplicación

#### Ejecutar el Backend
```bash
npm run start:backend
# O en modo desarrollo con reinicio automático:
npm run dev:backend
```

#### Ejecutar el Frontend (React Native con Expo)
```bash
npm run start:frontend
```
Esto iniciará Metro bundler, permitiendo ejecutar la app en web, emulador Android/iOS o la app Expo Go escaneando el código QR.

#### Ejecutar Ambos Simultáneamente
```bash
npm run start:dev
```

---

