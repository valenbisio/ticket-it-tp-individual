import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { diasEntre } from "../src/utils/fechas.js";

describe("diasEntre", () => {
  it("devuelve 0 cuando ambas fechas son el mismo día, sin importar la hora", () => {
    assert.equal(diasEntre(new Date(2026, 2, 10, 23, 59), new Date(2026, 2, 10, 0, 1)), 0);
  });

  it("devuelve días positivos cuando la fecha objetivo es futura", () => {
    assert.equal(diasEntre(new Date(2026, 2, 20, 21, 0), new Date(2026, 2, 10, 8, 30)), 10);
  });

  it("devuelve días negativos cuando la fecha objetivo ya pasó", () => {
    assert.equal(diasEntre(new Date(2026, 2, 5, 21, 0), new Date(2026, 2, 10, 8, 30)), -5);
  });

  it("cuenta los días de calendario al cruzar el cambio de mes", () => {
    assert.equal(diasEntre(new Date(2026, 3, 1, 0, 0), new Date(2026, 2, 31, 23, 30)), 1);
  });

  it("cuenta los días de calendario al cruzar el cambio de año", () => {
    assert.equal(diasEntre(new Date(2027, 0, 2, 1, 0), new Date(2026, 11, 31, 23, 0)), 2);
  });
});