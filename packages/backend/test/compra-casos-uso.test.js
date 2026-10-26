import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Compra } from "../src/models/Compra.js";
import { EstadoCompra } from "../src/models/EstadoCompra.js";
import { Evento } from "../src/models/Evento.js";
import { TipoEntrada } from "../src/models/TipoEntrada.js";
import { CompraRepository } from "../src/repositories/CompraRepository.js";
import { EventoRepository } from "../src/repositories/EventoRepository.js";
import { CompraService } from "../src/services/CompraService.js";

function contexto({ estado = EstadoCompra.CONFIRMADA, fecha = new Date(Date.now() + 86400000) } = {}) {
  const tipoEntrada = new TipoEntrada({ nombre: "General", precio: 100, cupo: 3 });
  const evento = new Evento({
    nombre: "Evento de prueba",
    descripcion: "Descripción",
    fecha,
    tiposEntrada: [tipoEntrada],
    organizador: { id: "organizador-1" },
  });
  const compra = new Compra({ comprador: { id: "comprador-1" }, evento, tipoEntrada, cantidad: 1, estado });
  const compraRepository = new CompraRepository({ compras: [compra] });
  const eventoRepository = new EventoRepository({ eventos: [evento] });
  return { compra, evento, tipoEntrada, service: new CompraService({ compraRepository, eventoRepository }) };
}

describe("nuevas operaciones de compras y eventos", () => {
  it("crea una compra y descuenta el cupo disponible", async () => {
    const { evento, tipoEntrada, service } = contexto();
    const compra = await service.realizarCompra(evento.id, "comprador-2", "General", 2);
    assert.equal(compra.cantidad, 2);
    assert.equal(compra.total, 200);
    assert.equal(tipoEntrada.cupo, 1);
  });

  it("rechaza una compra que supera el cupo", async () => {
    const { evento, service } = contexto();
    await assert.rejects(service.realizarCompra(evento.id, "comprador-2", "General", 4), /suficiente cupo/);
  });

  it("cancela una compra actualizando su estado", async () => {
    const { compra, service } = contexto();
    const resultado = await service.cancelarCompra(compra.id, "comprador-1");
    assert.equal(resultado.estado, EstadoCompra.CANCELADA);
  });

  it("permite enviar mensajes al comprador y al organizador", async () => {
    const { compra, service } = contexto();
    await service.enviarMensaje(compra.id, "comprador-1", "Consulta");
    await service.enviarMensaje(compra.id, "organizador-1", "Respuesta");
    assert.equal(compra.mensajes.length, 2);
  });

  it("permite reseñar solo una entrada utilizada", async () => {
    const { compra, evento, service } = contexto({ estado: EstadoCompra.UTILIZADA });
    const resenia = await service.calificarEvento(compra.id, "comprador-1", 5, "Excelente");
    assert.equal(resenia.puntuacion, 5);
    assert.equal(evento.resenias.length, 1);
  });
});
