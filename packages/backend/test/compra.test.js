import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Compra } from "../src/models/Compra.js";
import { EstadoCompra } from "../src/models/EstadoCompra.js";
import { Evento } from "../src/models/Evento.js";
import { TipoEntrada } from "../src/models/TipoEntrada.js";

const HOY = new Date(2026, 2, 10, 9, 0, 0);

function crearCompra({ estado = EstadoCompra.PENDIENTE, fechaEvento } = {}) {
  const tipoEntrada = new TipoEntrada({
    nombre: "General",
    descripcion: "Acceso general",
    precio: 1000,
    cupo: 10,
  });
  const evento = new Evento({
    nombre: "Evento de prueba",
    descripcion: "Descripción",
    fecha: fechaEvento,
  });

  return new Compra({
    comprador: { id: "usuario-1" },
    evento,
    tipoEntrada,
    cantidad: 2,
    estado,
  });
}

describe("Compra", () => {
  it("calcula el total a partir del precio del tipo de entrada y la cantidad", () => {
    const compra = crearCompra({ fechaEvento: new Date(2026, 3, 1) });

    assert.equal(compra.total, 2000);
  });

  it("confirma el pago solo cuando la compra está pendiente", () => {
    const compra = crearCompra();

    compra.confirmarPago();

    assert.equal(compra.estado, EstadoCompra.CONFIRMADA);
    assert.throws(() => { compra.estado = EstadoCompra.UTILIZADA; }, TypeError);
    assert.throws(() => compra.confirmarPago(), /Solo se pueden confirmar compras pendientes de pago/);
  });

  it("marca como utilizada solo una compra confirmada", () => {
    const compra = crearCompra({ estado: EstadoCompra.CONFIRMADA });

    compra.marcarComoUtilizada();

    assert.equal(compra.estado, EstadoCompra.UTILIZADA);
    assert.throws(() => crearCompra().marcarComoUtilizada(), /Solo se pueden validar compras confirmadas/);
  });

  it("permite calificar solo al comprador de una entrada utilizada y una sola vez", () => {
    const compraPendiente = crearCompra();
    const compraUtilizada = crearCompra({ estado: EstadoCompra.UTILIZADA });

    assert.throws(() => compraPendiente.validarPuedeCalificarse("usuario-1"), /entrada utilizada/);
    compraUtilizada.validarPuedeCalificarse("usuario-1");
    assert.throws(() => compraUtilizada.validarPuedeCalificarse("otro-usuario"), /Solo el comprador/);
    compraUtilizada.evento.resenias.push({ comprador: { id: "usuario-1" } });
    assert.throws(() => compraUtilizada.validarPuedeCalificarse("usuario-1"), /Ya calificaste/);
  });

  it("informa cuántos días faltan para el evento si está confirmada", () => {
    const compra = crearCompra({
      estado: EstadoCompra.CONFIRMADA,
      fechaEvento: new Date(2026, 2, 20, 21, 0),
    });

    assert.equal(compra.diasRestantesParaEvento(HOY), 10);
  });

  it("informa 0 días cuando el evento es hoy", () => {
    const compra = crearCompra({
      estado: EstadoCompra.CONFIRMADA,
      fechaEvento: new Date(2026, 2, 10, 23, 0),
    });

    assert.equal(compra.diasRestantesParaEvento(HOY), 0);
  });

  it("informa un valor negativo cuando el evento ya pasó", () => {
    const compra = crearCompra({
      estado: EstadoCompra.CONFIRMADA,
      fechaEvento: new Date(2026, 2, 1, 21, 0),
    });

    assert.equal(compra.diasRestantesParaEvento(HOY), -9);
  });

  it("no informa días restantes si la compra no está confirmada", () => {
    const estadosSinDias = [
      EstadoCompra.PENDIENTE,
      EstadoCompra.UTILIZADA,
      EstadoCompra.CANCELADA,
      EstadoCompra.REEMBOLSADA,
    ];

    for (const estado of estadosSinDias) {
      const compra = crearCompra({ estado, fechaEvento: new Date(2026, 2, 20) });

      assert.equal(compra.diasRestantesParaEvento(HOY), null, `estado ${estado}`);
    }
  });

  it("deja de informar días restantes cuando la compra cambia de estado", () => {
    const compra = crearCompra({
      estado: EstadoCompra.CONFIRMADA,
      fechaEvento: new Date(2026, 2, 20),
    });

    assert.equal(compra.diasRestantesParaEvento(HOY), 10);

    compra.tipoEntrada.reservar(compra.cantidad);
    compra.cancelar({ hoy: HOY });

    assert.equal(compra.diasRestantesParaEvento(HOY), null);
  });

  it("no informa días restantes si la compra no tiene evento asociado", () => {
    const tipoEntrada = new TipoEntrada({
      nombre: "General",
      descripcion: "Acceso general",
      precio: 1000,
      cupo: 10,
    });
    const compra = new Compra({
      comprador: { id: "usuario-1" },
      tipoEntrada,
      cantidad: 1,
      estado: EstadoCompra.CONFIRMADA,
    });

    assert.equal(compra.diasRestantesParaEvento(HOY), null);
  });
});
