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
import { usuarioRepository } from "./usuariosSeed.js";

export { usuarioRepository };

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

const comprador = usuarioRepository.obtenerPorId(COMPRADOR_DEMO_ID);
const compradorLucia = usuarioRepository.obtenerPorId("usuario-3");
const compradorMartin = usuarioRepository.obtenerPorId("usuario-4");

const organizador = new Usuario({
  id: "usuario-2",
  nombre: "Sala Norte",
  apellido: "Producciones",
});

const categoriaMusica = new Categoria({
  nombre: "Música",
  descripcion: "Recitales y festivales",
});

const categoriaTeatro = new Categoria({
  nombre: "Teatro",
  descripcion: "Obras y espectáculos",
});
const categoriasAdicionales = [
  new Categoria({ nombre: "Cine", descripcion: "Estrenos, ciclos y proyecciones" }),
  new Categoria({ nombre: "Deportes", descripcion: "Partidos y competencias" }),
  new Categoria({ nombre: "Comedia", descripcion: "Stand up y espectáculos de humor" }),
  new Categoria({ nombre: "Gastronomía", descripcion: "Ferias, degustaciones y experiencias culinarias" }),
  new Categoria({ nombre: "Arte y cultura", descripcion: "Exposiciones, museos y actividades culturales" }),
];

const recitalFuturo = new Evento({
  nombre: "Recital de Rock",
  descripcion: "Banda internacional en estadio",
  categoria: categoriaMusica,
  fecha: fechaEnDias(12),
  tiposEntrada: crearTiposEntrada({ precioGeneral: 15000, precioVip: 30000 }),
  organizador,
});

const festivalPasado = new Evento({
  nombre: "Festival de Jazz",
  descripcion: "Festival internacional de jazz",
  categoria: categoriaMusica,
  fecha: fechaEnDias(-2),
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
recitalFuturo.agregarResenia(new Resenia({ comprador: compradorLucia, evento: recitalFuturo, puntuacion: 4, detalle: "Muy buen recital." }));
festivalPasado.agregarResenia(new Resenia({ comprador: compradorMartin, evento: festivalPasado, puntuacion: 3, detalle: "Buena música, con algunos detalles." }));
obraDeTeatroPasada.agregarResenia(new Resenia({ comprador, evento: obraDeTeatroPasada, puntuacion: 2, detalle: "La obra podría mejorar." }));

// Los routers comparten estas instancias para que las altas y compras
// realizadas durante la ejecución vean los mismos objetos en memoria.
export const eventoRepository = new EventoRepository({
  eventos: [recitalFuturo, festivalPasado, obraDeTeatroPasada],
});
export const categoriaRepository = new CategoriaRepository([
  categoriaMusica,
  categoriaTeatro,
  ...categoriasAdicionales,
]);

const [recitalGeneral, recitalVip] = recitalFuturo.tiposEntrada;
const [festivalGeneral] = festivalPasado.tiposEntrada;
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
      comprador: compradorLucia,
      evento: recitalFuturo,
      tipoEntrada: recitalVip,
      cantidad: 1,
      estado: EstadoCompra.PENDIENTE,
    }),
    new Compra({
      comprador,
      evento: festivalPasado,
      tipoEntrada: festivalGeneral,
      cantidad: 1,
      estado: EstadoCompra.UTILIZADA,
    }),
    new Compra({
      comprador: compradorMartin,
      evento: obraDeTeatroPasada,
      tipoEntrada: teatroGeneral,
      cantidad: 4,
      estado: EstadoCompra.UTILIZADA,
    }),
    new Compra({
      comprador: compradorLucia,
      evento: obraDeTeatroPasada,
      tipoEntrada: teatroVip,
      cantidad: 1,
      estado: EstadoCompra.CANCELADA,
    }),
    new Compra({
      comprador: compradorMartin,
      evento: obraDeTeatroPasada,
      tipoEntrada: teatroGeneral,
      cantidad: 1,
      estado: EstadoCompra.REEMBOLSADA,
    }),
  ],
});

// Las compras demo reservan cupo como cualquier compra creada durante la sesión.
for (const compra of compraRepository.obtenerTodas()) {
  if (![EstadoCompra.CANCELADA, EstadoCompra.REEMBOLSADA].includes(compra.estado)) {
    compra.tipoEntrada.reducirCupo(compra.cantidad);
  }
}

