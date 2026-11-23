import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Resenia } from "../src/models/Resenia.js";

describe("Resenia", () => {
  it("acepta puntuaciones válidas y normaliza el comentario", () => {
    const resenia = new Resenia({ puntuacion: 5, detalle: "  Excelente evento  " });

    assert.equal(resenia.puntuacion, 5);
    assert.equal(resenia.detalle, "Excelente evento");
  });

  it("rechaza puntuaciones y comentarios fuera de las reglas del dominio", () => {
    assert.throws(() => new Resenia({ puntuacion: 0 }), /entero entre 1 y 5/);
    assert.throws(() => new Resenia({ puntuacion: 6 }), /entero entre 1 y 5/);
    assert.throws(() => new Resenia({ puntuacion: 4.5 }), /entero entre 1 y 5/);
    assert.throws(() => new Resenia({ puntuacion: 4, detalle: 42 }), /1000 caracteres/);
    assert.throws(() => new Resenia({ puntuacion: 4, detalle: "x".repeat(1001) }), /1000 caracteres/);
  });
});
