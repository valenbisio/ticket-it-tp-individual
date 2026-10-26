import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Compra } from "../src/models/Compra.js";
import { EstadoCompra } from "../src/models/EstadoCompra.js";
import { Evento } from "../src/models/Evento.js";
import { TipoEntrada } from "../src/models/TipoEntrada.js";
import { CompraRepository } from "../src/repositories/CompraRepository.js";
import { CompraService } from "../src/services/CompraService.js";

const HOY = new Date(2026, 2, 10, 9, 0, 0);

function crearCompra({ compradorId = "usuario-1", estado, fechaEvento, cantidad = 1 } = {}) {
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
    comprador: { id: compradorId },
    evento,
    tipoEntrada,
    cantidad,
    estado,
  });
}

function crearService(compras) {
  const compraRepository = new CompraRepository({ compras });
  return new CompraService({ compraRepository, hoy: HOY });
}

describe("CompraService", () => {
  it("devuelve solo las compras del comprador indicado", () => {
    const service = crearService([
      crearCompra({ compradorId: "usuario-1", estado: EstadoCompra.PENDIENTE, fechaEvento: new Date(2026, 2, 20) }),
      crearCompra({ compradorId: "usuario-1", estado: EstadoCompra.CONFIRMADA, fechaEvento: new Date(2026, 2, 20) }),
      crearCompra({ compradorId: "usuario-2", estado: EstadoCompra.CONFIRMADA, fechaEvento: new Date(2026, 2, 25) }),
    ]);

    const resultado = service.obtenerComprasDeUsuario("usuario-1");

    assert.equal(resultado.usuarioId, "usuario-1");
    assert.equal(resultado.compras.length, 2);
  });

  it("incluye los días restantes solo para compras confirmadas", () => {
    const service = crearService([
      crearCompra({ estado: EstadoCompra.CONFIRMADA, fechaEvento: new Date(2026, 2, 20, 21, 0), cantidad: 2 }),
      crearCompra({ estado: EstadoCompra.PENDIENTE, fechaEvento: new Date(2026, 2, 20, 21, 0) }),
    ]);

    const { compras } = service.obtenerComprasDeUsuario("usuario-1");
    const [confirmada, pendiente] = compras;

    assert.equal(confirmada.estado, EstadoCompra.CONFIRMADA);
    assert.equal(confirmada.diasRestantesParaEvento, 10);
    assert.equal(confirmada.total, 2000);

    assert.equal(pendiente.estado, EstadoCompra.PENDIENTE);
    assert.equal(pendiente.diasRestantesParaEvento, null);
  });

  it("devuelve una lista vacía para un comprador sin compras", () => {
    const service = crearService([]);

    const resultado = service.obtenerComprasDeUsuario("usuario-desconocido");

    assert.deepEqual(resultado, { usuarioId: "usuario-desconocido", compras: [] });
  });

  it("devuelve las compras asociadas a un evento con sus estados y cupos disponibles", () => {
    const tipoGeneral = new TipoEntrada({
      nombre: "General",
      descripcion: "General",
      precio: 1000,
      cupo: 8,
    });
    const evento = new Evento({
      id: "evento-123",
      nombre: "Concierto",
      descripcion: "Concierto rock",
      fecha: new Date(2026, 2, 20),
      tiposEntrada: [tipoGeneral],
    });

    const compra = new Compra({
      comprador: { id: "usuario-1", nombre: "Ana", apellido: "Gomez" },
      evento,
      tipoEntrada: tipoGeneral,
      cantidad: 2,
      estado: EstadoCompra.CONFIRMADA,
    });

    const service = crearService([compra]);

    const resultado = service.obtenerComprasDeEvento("evento-123");

    assert.equal(resultado.evento.id, "evento-123");
    assert.equal(resultado.evento.tiposEntrada[0].cupoDisponible, 8);
    assert.equal(resultado.compras.length, 1);
    assert.equal(resultado.compras[0].estado, EstadoCompra.CONFIRMADA);
    assert.equal(resultado.compras[0].comprador.nombre, "Ana");
  });

  it("lanza error si se consultan compras de un evento inexistente", () => {
    const service = crearService([]);

    assert.throws(() => {
      service.obtenerComprasDeEvento("evento-fantasma");
    }, /Evento no encontrado/);
  });
});
