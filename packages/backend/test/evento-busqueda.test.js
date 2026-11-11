import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Categoria } from "../src/models/Categoria.js";
import { Evento } from "../src/models/Evento.js";
import { CategoriaRepository } from "../src/repositories/CategoriaRepository.js";
import { EventoRepository } from "../src/repositories/EventoRepository.js";
import { EventoService } from "../src/services/EventoService.js";

const organizadorSalaNorte = {
  id: "organizador-1",
  nombre: "Sala",
  apellido: "Norte",
};

const organizadorProductora = {
  id: "organizador-2",
  nombre: "Productora",
  apellido: "Demo",
};

function crearContexto() {
  const musica = new Categoria({ nombre: "Música", descripcion: "Recitales y festivales" });
  const teatro = new Categoria({ nombre: "Teatro", descripcion: "Obras y espectáculos" });

  const eventos = [
    new Evento({
      nombre: "Festival de Música",
      descripcion: "Rock y pop al aire libre",
      categoria: musica,
      fecha: new Date("2026-12-01T21:00:00.000Z"),
      organizador: organizadorSalaNorte,
    }),
    new Evento({
      nombre: "Obra de Teatro",
      descripcion: "Clásico argentino",
      categoria: teatro,
      fecha: new Date("2026-11-20T21:00:00.000Z"),
      organizador: organizadorProductora,
    }),
    new Evento({
      nombre: "Recital de Rock",
      descripcion: "Banda internacional",
      categoria: musica,
      fecha: new Date("2026-11-25T21:00:00.000Z"),
      organizador: organizadorSalaNorte,
    }),
  ];

  return {
    musica,
    teatro,
    service: new EventoService({
      eventoRepository: new EventoRepository({ eventos }),
      categoriaRepository: new CategoriaRepository([musica, teatro]),
    }),
  };
}

const nombres = (eventos) => eventos.map((evento) => evento.nombre);

describe("EventoService - búsqueda de eventos", () => {
  it("encuentra eventos por nombre sin distinguir mayúsculas", async () => {
    const { service } = crearContexto();

    const resultado = await service.buscarEventos({ texto: "FESTIVAL" });

    assert.deepEqual(nombres(resultado), ["Festival de Música"]);
  });

  it("encuentra eventos por nombre sin distinguir tildes", async () => {
    const categoria = new Categoria({ nombre: "Otros", descripcion: "Otros eventos" });
    const evento = new Evento({
      nombre: "Canción de Verano",
      descripcion: "Show íntimo",
      categoria,
      fecha: new Date("2026-12-05T21:00:00.000Z"),
      organizador: organizadorSalaNorte,
    });
    const service = new EventoService({
      eventoRepository: new EventoRepository({ eventos: [evento] }),
      categoriaRepository: new CategoriaRepository([categoria]),
    });

    const resultado = await service.buscarEventos({ texto: "cancion" });

    assert.deepEqual(nombres(resultado), ["Canción de Verano"]);
  });

  it("encuentra eventos por categoría sin distinguir tildes", async () => {
    const { service } = crearContexto();

    const resultado = await service.buscarEventos({ texto: "musica" });

    assert.deepEqual(nombres(resultado), ["Festival de Música", "Recital de Rock"]);
  });

  it("encuentra eventos por descripción ignorando tildes", async () => {
    const { service } = crearContexto();

    const resultado = await service.buscarEventos({ texto: "clasico" });

    assert.deepEqual(nombres(resultado), ["Obra de Teatro"]);
  });

  it("encuentra eventos por categoría y organizador", async () => {
    const { service } = crearContexto();

    const porCategoria = await service.buscarEventos({ texto: "teatro" });
    const porOrganizador = await service.buscarEventos({ texto: "sala norte" });

    assert.deepEqual(nombres(porCategoria), ["Obra de Teatro"]);
    assert.deepEqual(nombres(porOrganizador), ["Festival de Música", "Recital de Rock"]);
  });

  it("exige que todas las palabras buscadas aparezcan", async () => {
    const { service } = crearContexto();

    const coincidencias = await service.buscarEventos({ texto: "rock pop" });

    assert.deepEqual(nombres(coincidencias), ["Festival de Música"]);
  });

  it("ignora espacios sobrantes alrededor del texto", async () => {
    const { service } = crearContexto();

    const resultado = await service.buscarEventos({ texto: "   festival   " });

    assert.deepEqual(nombres(resultado), ["Festival de Música"]);
  });

  it("devuelve todos los eventos cuando no se envía texto", async () => {
    const { service } = crearContexto();

    const resultado = await service.buscarEventos();

    assert.equal(resultado.length, 3);
  });

  it("devuelve una lista vacía cuando no hay coincidencias", async () => {
    const { service } = crearContexto();

    const resultado = await service.buscarEventos({ texto: "heavy metal" });

    assert.deepEqual(resultado, []);
  });

  it("filtra por categoría sin texto de búsqueda", async () => {
    const { service, musica, teatro } = crearContexto();

    const deMusica = await service.buscarEventos({ categoria: musica.id });
    const deTeatro = await service.buscarEventos({ categoria: teatro.id });

    assert.deepEqual(nombres(deMusica), ["Festival de Música", "Recital de Rock"]);
    assert.deepEqual(nombres(deTeatro), ["Obra de Teatro"]);
  });

  it("combina el filtro por categoría con la búsqueda textual", async () => {
    const { service, teatro } = crearContexto();

    const resultado = await service.buscarEventos({ texto: "rock", categoria: teatro.id });

    assert.deepEqual(resultado, []);
  });

  it("rechaza una categoría inexistente", async () => {
    const { service } = crearContexto();

    await assert.rejects(
      service.buscarEventos({ categoria: "categoria-fantasma" }),
      /no existe/,
    );
  });
});