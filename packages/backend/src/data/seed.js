import {
  Categoria,
  Compra,
  EstadoCompra,
  Evento,
  TipoEntrada,
  Usuario,
  Resenia,
} from "../models/index.js";
import { CompraRepository } from "../repositories/CompraRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { CategoriaRepository } from "../repositories/CategoriaRepository.js";

/**
 * ID histórico del comprador de ejemplo incluido en las compras semilla.
 */
export const COMPRADOR_DEMO_ID = "usuario-1";

function fechaEnDias(dias, { hora = 21 } = {}) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(hora, 0, 0, 0);
  return fecha;
}

function crearTiposEntrada({ precioGeneral, precioVip }) {
  return [
    new TipoEntrada({
      nombre: "General",
      descripcion: "Acceso general al evento",
      precio: precioGeneral,
      cupo: 100,
    }),
    new TipoEntrada({
      nombre: "VIP",
      descripcion: "Acceso preferencial y primer sector",
      precio: precioVip,
      cupo: 20,
    }),
  ];
}

const comprador = new Usuario({
  id: COMPRADOR_DEMO_ID,
  nombre: "Valentina",
  apellido: "Bisio",
});

const organizador = new Usuario({
  id: "usuario-2",
  nombre: "Productora",
  apellido: "Demo",
});

const categoriaMusica = new Categoria({
  nombre: "Música",
  descripcion: "Recitales y festivales",
});

const categoriaTeatro = new Categoria({
  nombre: "Teatro",
  descripcion: "Obras y espectáculos",
});

const recitalFuturo = new Evento({
  nombre: "Recital de Rock",
  descripcion: "Banda internacional en estadio",
  categoria: categoriaMusica,
  fecha: fechaEnDias(12),
  tiposEntrada: crearTiposEntrada({ precioGeneral: 15000, precioVip: 30000 }),
  organizador,
});

const festivalDeHoy = new Evento({
  nombre: "Festival de Jazz",
  descripcion: "Festival internacional de jazz",
  categoria: categoriaMusica,
  fecha: fechaEnDias(0, { hora: 23 }),
  tiposEntrada: crearTiposEntrada({ precioGeneral: 9000, precioVip: 18000 }),
  organizador,
});

const obraDeTeatroPasada = new Evento({
  nombre: "Obra de Teatro",
  descripcion: "Clásico del teatro argentino",
  categoria: categoriaTeatro,
  fecha: fechaEnDias(-21),
  tiposEntrada: crearTiposEntrada({ precioGeneral: 7000, precioVip: 14000 }),
  organizador,
});

recitalFuturo.agregarResenia(new Resenia({ comprador, evento: recitalFuturo, puntuacion: 5, detalle: "Excelente puesta y sonido." }));
recitalFuturo.agregarResenia(new Resenia({ comprador, evento: recitalFuturo, puntuacion: 4, detalle: "Muy buen recital." }));
festivalDeHoy.agregarResenia(new Resenia({ comprador, evento: festivalDeHoy, puntuacion: 3, detalle: "Buena música, con algunos detalles." }));
obraDeTeatroPasada.agregarResenia(new Resenia({ comprador, evento: obraDeTeatroPasada, puntuacion: 2, detalle: "La obra podría mejorar." }));

// Los routers comparten estas instancias para que las altas y compras
// realizadas durante la ejecución vean los mismos objetos en memoria.
export const eventoRepository = new EventoRepository({
  eventos: [recitalFuturo, festivalDeHoy, obraDeTeatroPasada],
});
export const categoriaRepository = new CategoriaRepository([
  categoriaMusica,
  categoriaTeatro,
]);

const [recitalGeneral, recitalVip] = recitalFuturo.tiposEntrada;
const [festivalGeneral] = festivalDeHoy.tiposEntrada;
const [teatroGeneral, teatroVip] = obraDeTeatroPasada.tiposEntrada;

export const compraRepository = new CompraRepository({
  compras: [
    new Compra({
      comprador,
      evento: recitalFuturo,
      tipoEntrada: recitalGeneral,
      cantidad: 2,
      estado: EstadoCompra.CONFIRMADA,
    }),
    new Compra({
      comprador,
      evento: recitalFuturo,
      tipoEntrada: recitalVip,
      cantidad: 1,
      estado: EstadoCompra.PENDIENTE,
    }),
    new Compra({
      comprador,
      evento: festivalDeHoy,
      tipoEntrada: festivalGeneral,
      cantidad: 1,
      estado: EstadoCompra.CONFIRMADA,
    }),
    new Compra({
      comprador,
      evento: obraDeTeatroPasada,
      tipoEntrada: teatroGeneral,
      cantidad: 4,
      estado: EstadoCompra.UTILIZADA,
    }),
    new Compra({
      comprador,
      evento: obraDeTeatroPasada,
      tipoEntrada: teatroVip,
      cantidad: 1,
      estado: EstadoCompra.CANCELADA,
    }),
    new Compra({
      comprador,
      evento: obraDeTeatroPasada,
      tipoEntrada: teatroGeneral,
      cantidad: 1,
      estado: EstadoCompra.REEMBOLSADA,
    }),
  ],
});

