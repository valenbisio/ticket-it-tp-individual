---
name: arquitectura-capas
description: Guía al agente para escribir y revisar el backend (Node + Express) respetando la arquitectura por capas (rutas/controllers, servicios, dominio, repositorios) y evitando el modelo anémico, poniendo las reglas de negocio dentro de las entidades. Activar siempre que se cree o modifique un endpoint, ruta, controller, servicio, entidad, modelo, repositorio o regla de negocio en packages/backend, o cuando el usuario mencione capas, arquitectura, modelo anémico, dominio rico, DDD, "dónde va esta lógica", responsabilidades o refactor del backend, aunque no lo pida explícitamente.
---

# Arquitectura por capas y dominio rico en el backend

Dos objetivos: que cada capa haga solo lo suyo con dependencias en una sola dirección, y que las reglas de negocio vivan en el dominio y no desparramadas en servicios o controllers. Un **modelo anémico** (entidades que son bolsas de datos con getters y setters, y servicios llenos de `if`) se evita escribiendo comportamiento dentro de las entidades.

## Cuándo usarla
- Se crea o modifica un endpoint, ruta, controller, servicio, entidad, modelo o repositorio.
- Se agrega o cambia una regla de negocio: validaciones, transiciones de estado, cálculos, permisos.
- Hay duda de dónde va una pieza de lógica.
- Se pide revisar o refactorizar el backend, o aparece código con entidades que solo tienen getters y setters.
- Se escriben tests del backend (la capa determina qué tipo de test corresponde).

## Pasos

1. **Identificar la estructura existente.** Mirar `packages/backend/src` y respetar sus carpetas y su estilo (módulos ES o CommonJS, clases o funciones). No crear una estructura nueva si ya hay una; si faltan capas, proponer cómo completarlas antes de escribir.

2. **Ubicar cada pieza de lógica en su capa**, antes de escribirla:

   | Capa | Responsabilidad | Prohibido |
   |------|-----------------|-----------|
   | **Rutas / Controllers** | Leer `req`, validar el formato de la entrada, llamar a un servicio, convertir resultado y errores a HTTP (status, DTOs). | Reglas de negocio, acceso a la base, `if` sobre el estado de una entidad. |
   | **Servicios** (casos de uso) | Orquestar: cargar entidades con el repositorio, invocar métodos del dominio, persistir, coordinar transacciones. | Conocer `req`/`res`, reglas de negocio propias, asignar campos de una entidad. |
   | **Dominio** | Entidades y value objects con estado **y comportamiento**; garantizan sus invariantes y lanzan errores de dominio. | Importar Express, el ORM, el driver de la base o cualquier otra capa. |
   | **Repositorios** | Guardar y recuperar entidades, consultas, traducir entre el formato de la base y las entidades. | Reglas de negocio, conocer HTTP. |

   Dirección de dependencias: controller → servicio → dominio, y servicio → repositorio → dominio. El dominio no depende de nadie. Nunca saltarse capas: un controller no llama a un repositorio directamente.

3. **Escribir de adentro hacia afuera:** primero la entidad con sus reglas, después el repositorio, el servicio y por último el controller y la ruta.

4. **Aplicar las reglas de un dominio rico:**

   1. **Métodos con intención de negocio.** `cerrar()`, `asignarA(usuario)`, `agregarComentario(c)`; no `setEstado('CERRADO')`.
   2. **Siempre válida.** El constructor o una factory valida; no se crean entidades inválidas, y cada método que cambia el estado mantiene sus invariantes.
   3. **Estado encapsulado.** Campos privados (`#campo`) o sin setters públicos; las colecciones internas no se exponen para modificarse desde afuera.
   4. **Tell, don't ask.** El servicio no pregunta por el estado para decidir: le dice a la entidad qué hacer y ella decide.
   5. **Errores de dominio.** Una regla violada lanza un error propio (`ReglaDeNegocioError`), nunca un error de HTTP ni un `Error` genérico.
   6. **Value objects** inmutables para conceptos con reglas propias (email, dinero, rango de fechas), cuando aporten claridad.

5. **Detectar y corregir el modelo anémico.** Señales de alarma: clases de dominio con solo propiedades, getters y setters; servicios que consultan el estado de una entidad y después le asignan campos; la misma validación repetida en varios servicios o controllers; clases `Helper`, `Utils` o `Manager` con reglas de negocio; entidades creadas como objetos literales sin validación. La corrección es mover esa lógica a un método de la entidad y dejar el servicio como orquestador.

   ```js
   // MAL (anémico): la regla vive en el servicio
   class TicketService {
     async cerrar(id) {
       const t = await this.repo.buscarPorId(id);
       if (t.estado === 'CERRADO') throw new Error('Ya cerrado');
       if (!t.asignadoA) throw new Error('Sin asignar');
       t.estado = 'CERRADO';
       await this.repo.guardar(t);
     }
   }

   // BIEN (rico): la regla vive en la entidad
   class Ticket {
     #estado = 'ABIERTO';
     #asignadoA = null;

     cerrar() {
       if (this.#estado === 'CERRADO') throw new ReglaDeNegocioError('El ticket ya está cerrado');
       if (!this.#asignadoA) throw new ReglaDeNegocioError('No se puede cerrar un ticket sin asignar');
       this.#estado = 'CERRADO';
     }
   }

   class TicketService {
     async cerrar(id) {
       const ticket = await this.repo.buscarPorId(id);
       ticket.cerrar();                 // el dominio decide
       await this.repo.guardar(ticket); // el servicio persiste
       return ticket;
     }
   }
   ```

   Si la entidad es un CRUD sin reglas, no inventar comportamiento: una entidad simple está bien.

6. **Mantener el controller delgado y centralizar los errores.** El controller solo traduce y delega los errores a un middleware que los mapea a HTTP en un solo lugar (`ReglaDeNegocioError` → 409 o 422, `NoEncontradoError` → 404). Devolver DTOs, no la entidad cruda ni el documento de la base.

   ```js
   router.post('/:id/cerrar', async (req, res, next) => {
     try {
       const ticket = await ticketService.cerrar(req.params.id);
       res.json(toTicketDTO(ticket));
     } catch (err) {
       next(err);
     }
   });
   ```

7. **Verificar con el checklist** antes de dar el trabajo por terminado:
   - ¿Ningún controller contiene reglas de negocio ni accede a la base?
   - ¿Ningún servicio hace `entidad.campo = valor` ni decide reglas con `if` sobre el estado de la entidad?
   - ¿Las reglas están en métodos de las entidades, con nombres del lenguaje del negocio?
   - ¿Las entidades no pueden quedar en estado inválido?
   - ¿El dominio no importa Express, el ORM ni nada de otras capas?
   - ¿Las dependencias van controller → servicio → dominio / repositorio, sin saltos de capa?
   - ¿Los errores de dominio no conocen HTTP y se traducen en un solo lugar?
   - ¿Hay tests del dominio que cubran las reglas, incluido el camino de error?

8. **Agregar o sugerir tests según la capa:**
   - Dominio: unitarios puros, sin Express, sin base y sin mocks. Acá se prueban las reglas de negocio.
   - Servicios: con un repositorio falso en memoria; verifican la orquestación.
   - Controllers y rutas: con `supertest`; verifican status codes y formato de entrada y salida.
   - Repositorios: contra una base de prueba o en memoria.

## Formato de salida

**Al escribir código nuevo:** entregar los archivos agrupados por capa (dominio, repositorio, servicio, controller o ruta, tests) y, al final, una línea corta que indique dónde quedó cada regla, por ejemplo: `Reglas en dominio: Ticket.cerrar() (no cerrar dos veces, requiere asignado). Servicio: solo orquesta. Controller: mapea errores a 409.`

**Al revisar código existente:** entregar una tabla de hallazgos y luego el refactor propuesto.

| Archivo | Violación | Tipo | Corrección |
|---------|-----------|------|------------|
| `services/ticketService.js` | Valida el estado y asigna `t.estado = 'CERRADO'` | Modelo anémico | Mover la regla a `Ticket.cerrar()` |
| `routes/tickets.js` | Llama directo a `ticketRepository` | Salto de capa | Pasar por `TicketService` |

**Siempre:** cerrar con el checklist del paso 7 marcado (✓ cumple, ✗ no cumple, N/A no aplica). Si una corrección implica cambios grandes, como renombrar carpetas o cambiar la forma de persistir, proponerlo primero en lugar de hacerlo sin avisar.
