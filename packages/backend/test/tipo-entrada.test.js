import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EstadoCompra } from "../src/models/EstadoCompra.js";
import { TipoEntrada } from "../src/models/TipoEntrada.js";

function crearTipoEntrada(cupo = 5) {
  return new TipoEntrada({ nombre: "General", descripcion: "Acceso general", precio: 100, cupo });
}

describe("TipoEntrada", () => {
  it("reserva cupo disponible y evita superar el máximo", () => {
    const tipo = crearTipoEntrada();

    tipo.reservar(2);

    assert.equal(tipo.cupo, 3);
    assert.throws(() => tipo.reservar(4), /No hay suficiente cupo/);
    assert.equal(tipo.cupo, 3);
  });

  it("considera las compras activas al reservar y excluye canceladas o reembolsadas", () => {
    const tipo = crearTipoEntrada(5);
    tipo.reservar(2);
    const compras = [
      { tipoEntrada: tipo, cantidad: 2, estado: EstadoCompra.PENDIENTE },
      { tipoEntrada: tipo, cantidad: 1, estado: EstadoCompra.CANCELADA },
      { tipoEntrada: tipo, cantidad: 1, estado: EstadoCompra.REEMBOLSADA },
    ];

    tipo.reservar(1, compras);

    assert.equal(tipo.cupo, 2);
  });

  it("libera solo cantidades válidas sin superar el cupo original", () => {
    const tipo = crearTipoEntrada(5);
    tipo.reservar(2);
    tipo.liberar(2);

    assert.equal(tipo.cupo, 5);
    assert.throws(() => tipo.liberar(1), /No se puede liberar/);
    assert.throws(() => tipo.reservar(0), /entero positivo/);
    assert.throws(() => { tipo.cupo = 20; }, TypeError);
  });

  it("rechaza configuraciones de precio y cupo inválidas", () => {
    assert.throws(() => crearTipoEntrada(0), /cupo debe ser un entero positivo/);
    assert.throws(() => new TipoEntrada({ nombre: "VIP", precio: -1, cupo: 1 }), /precio/);
  });
});
