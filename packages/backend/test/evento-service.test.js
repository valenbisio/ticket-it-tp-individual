import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Categoria } from "../src/models/Categoria.js";
import { Evento } from "../src/models/Evento.js";
import { CategoriaRepository } from "../src/repositories/CategoriaRepository.js";
import { EventoRepository } from "../src/repositories/EventoRepository.js";
import { EventoService } from "../src/services/EventoService.js";

describe("EventoService", () => {
  it("calcula el puntaje del organizador con las reseñas de todos sus eventos", async () => {
    const categoria = new Categoria({ nombre: "Música", descripcion: "Recitales" });
    const organizador = { id: "organizador-1", nombre: "Productora", apellido: "Demo" };
    const eventos = [
      new Evento({ nombre: "Evento A", descripcion: "A", categoria, organizador, resenias: [{ puntuacion: 5 }] }),
      new Evento({ nombre: "Evento B", descripcion: "B", categoria, organizador, resenias: [{ puntuacion: 3 }] }),
    ];
    const service = new EventoService({
      eventoRepository: new EventoRepository({ eventos }),
      categoriaRepository: new CategoriaRepository([categoria]),
    });

    const resultado = await service.buscarEventos();

    assert.deepEqual(resultado.map((evento) => evento.puntajeOrganizador), [4, 4]);
  });
});
