export type ClientStatus = "active" | "inactive"

export interface Order {
  id: string
  date: string
  total: number
  status: "Pagado" | "Pendiente" | "Anulado"
}

export interface Client {
  id: string
  nit: string
  razonSocial: string
  correo: string
  telefono: string
  direccion: string
  estado: ClientStatus
  saldo: number
  createdAt: string
  lastModifiedAt: string
  lastModifiedBy: string
  orders: Order[]
}

export const clients: Client[] = [
  {
    id: "c1",
    nit: "900123456-7",
    razonSocial: "Comercializadora Andina S.A.S.",
    correo: "pagos@andina.co",
    telefono: "+57 601 4567890",
    direccion: "Calle 100 #19-54, Oficina 802, Bogotá D.C.",
    estado: "active",
    saldo: 2450000,
    createdAt: "2024-02-11",
    lastModifiedAt: "2026-09-02",
    lastModifiedBy: "María Fernanda Gómez",
    orders: [
      { id: "PED-1042", date: "2026-09-01", total: 1200000, status: "Pendiente" },
      { id: "PED-0987", date: "2026-08-14", total: 1250000, status: "Pendiente" },
      { id: "PED-0921", date: "2026-07-30", total: 890000, status: "Pagado" },
    ],
  },
  {
    id: "c2",
    nit: "830098765-1",
    razonSocial: "Logística del Pacífico Ltda.",
    correo: "facturacion@pacifico.com",
    telefono: "+57 602 3312200",
    direccion: "Av. 3 Norte #24-46, Cali, Valle del Cauca",
    estado: "active",
    saldo: 0,
    createdAt: "2023-11-03",
    lastModifiedAt: "2026-06-18",
    lastModifiedBy: "Carlos Andrés Ruiz",
    orders: [
      { id: "PED-1010", date: "2026-06-10", total: 3400000, status: "Pagado" },
      { id: "PED-0855", date: "2026-04-22", total: 1780000, status: "Pagado" },
    ],
  },
  {
    id: "c3",
    nit: "901456789-3",
    razonSocial: "Distribuciones El Roble S.A.",
    correo: "contabilidad@elroble.co",
    telefono: "+57 604 5540011",
    direccion: "Carrera 43A #1-50, Torre Sur, Medellín, Antioquia",
    estado: "inactive",
    saldo: 0,
    createdAt: "2022-08-19",
    lastModifiedAt: "2025-12-01",
    lastModifiedBy: "María Fernanda Gómez",
    orders: [{ id: "PED-0501", date: "2025-11-20", total: 620000, status: "Pagado" }],
  },
  {
    id: "c4",
    nit: "800567123-9",
    razonSocial: "Tecnología Global Corp.",
    correo: "invoices@techglobal.com",
    telefono: "+57 601 7788990",
    direccion: "Calle 26 #92-32, Zona Franca, Bogotá D.C.",
    estado: "active",
    saldo: 5820000,
    createdAt: "2024-05-27",
    lastModifiedAt: "2026-09-15",
    lastModifiedBy: "Carlos Andrés Ruiz",
    orders: [
      { id: "PED-1099", date: "2026-09-12", total: 4200000, status: "Pendiente" },
      { id: "PED-1077", date: "2026-09-05", total: 1620000, status: "Pendiente" },
    ],
  },
  {
    id: "c5",
    nit: "901889002-4",
    razonSocial: "Agroindustrias del Llano S.A.S.",
    correo: "tesoreria@agrollano.co",
    telefono: "+57 608 6620033",
    direccion: "Km 5 vía Puerto López, Villavicencio, Meta",
    estado: "active",
    saldo: 340000,
    createdAt: "2025-01-14",
    lastModifiedAt: "2026-08-28",
    lastModifiedBy: "Laura Restrepo",
    orders: [{ id: "PED-1005", date: "2026-08-20", total: 340000, status: "Pendiente" }],
  },
  {
    id: "c6",
    nit: "860112233-5",
    razonSocial: "Servicios Financieros Unidos",
    correo: "admin@sfunidos.com",
    telefono: "+57 601 2201199",
    direccion: "Carrera 7 #71-21, Piso 12, Bogotá D.C.",
    estado: "inactive",
    saldo: 0,
    createdAt: "2021-03-30",
    lastModifiedAt: "2024-10-10",
    lastModifiedBy: "Carlos Andrés Ruiz",
    orders: [],
  },
]

/* ------------------------------------------------------------------ */
/* MÓDULO 2 · PRODUCTOS                                                */
/* ------------------------------------------------------------------ */

export type ProductStatus = "active" | "inactive"

export type ProductCategory =
  | "Electrónica"
  | "Oficina"
  | "Hogar"
  | "Industrial"
  | "Servicios"

export const productCategories: ProductCategory[] = [
  "Electrónica",
  "Oficina",
  "Hogar",
  "Industrial",
  "Servicios",
]

export interface ProductChange {
  date: string
  user: string
  description: string
}

export interface Product {
  id: string
  code: string
  name: string
  price: number
  cost: number
  iva: number
  stockMin: number
  stock: number
  category: ProductCategory
  estado: ProductStatus
  createdAt: string
  lastModifiedAt: string
  lastModifiedBy: string
  history: ProductChange[]
  /** Net daily stock movement over the last 30 days (+ entradas / − salidas). */
  movement: number[]
}

// Deterministic pseudo-random movement so charts stay stable across renders.
function movementSeries(seed: number): number[] {
  let s = seed
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
  return Array.from({ length: 30 }, () => Math.round((rand() - 0.45) * 22))
}

export type StockLevel = "ok" | "low" | "out"

export function stockLevel(p: Product): StockLevel {
  if (p.stock <= 0) return "out"
  if (p.stock <= p.stockMin) return "low"
  return "ok"
}

export const products: Product[] = [
  {
    id: "p1",
    code: "ELEC-1001",
    name: "Monitor LED 27\" UltraWide",
    price: 1290000,
    cost: 890000,
    iva: 19,
    stockMin: 10,
    stock: 42,
    category: "Electrónica",
    estado: "active",
    createdAt: "2024-03-12",
    lastModifiedAt: "2026-09-10",
    lastModifiedBy: "María Fernanda Gómez",
    history: [
      { date: "2026-09-10", user: "María Fernanda Gómez", description: "Precio actualizado de $1.190.000 a $1.290.000" },
      { date: "2026-06-01", user: "Carlos Andrés Ruiz", description: "Stock mínimo ajustado de 8 a 10 unidades" },
    ],
    movement: movementSeries(11),
  },
  {
    id: "p2",
    code: "OFIC-2043",
    name: "Silla Ergonómica Executive",
    price: 780000,
    cost: 510000,
    iva: 19,
    stockMin: 15,
    stock: 8,
    category: "Oficina",
    estado: "active",
    createdAt: "2023-10-05",
    lastModifiedAt: "2026-08-22",
    lastModifiedBy: "Laura Restrepo",
    history: [
      { date: "2026-08-22", user: "Laura Restrepo", description: "Costo actualizado de $480.000 a $510.000" },
    ],
    movement: movementSeries(29),
  },
  {
    id: "p3",
    code: "HOGA-3120",
    name: "Cafetera Programable 1.8L",
    price: 320000,
    cost: 195000,
    iva: 19,
    stockMin: 12,
    stock: 0,
    category: "Hogar",
    estado: "active",
    createdAt: "2024-01-20",
    lastModifiedAt: "2026-09-14",
    lastModifiedBy: "Carlos Andrés Ruiz",
    history: [
      { date: "2026-09-14", user: "Carlos Andrés Ruiz", description: "Salida de inventario por pedido PED-1099 (12 uds)" },
    ],
    movement: movementSeries(47),
  },
  {
    id: "p4",
    code: "INDU-4501",
    name: "Taladro Industrial 1200W",
    price: 540000,
    cost: 360000,
    iva: 19,
    stockMin: 6,
    stock: 23,
    category: "Industrial",
    estado: "active",
    createdAt: "2023-07-18",
    lastModifiedAt: "2026-05-30",
    lastModifiedBy: "María Fernanda Gómez",
    history: [],
    movement: movementSeries(63),
  },
  {
    id: "p5",
    code: "ELEC-1099",
    name: "Teclado Mecánico Retroiluminado",
    price: 235000,
    cost: 140000,
    iva: 19,
    stockMin: 20,
    stock: 20,
    category: "Electrónica",
    estado: "active",
    createdAt: "2024-06-02",
    lastModifiedAt: "2026-09-01",
    lastModifiedBy: "Laura Restrepo",
    history: [
      { date: "2026-09-01", user: "Laura Restrepo", description: "Entrada de inventario (50 uds)" },
    ],
    movement: movementSeries(81),
  },
  {
    id: "p6",
    code: "OFIC-2077",
    name: "Impresora Multifuncional Láser",
    price: 990000,
    cost: 720000,
    iva: 19,
    stockMin: 5,
    stock: 4,
    category: "Oficina",
    estado: "active",
    createdAt: "2023-12-11",
    lastModifiedAt: "2026-07-19",
    lastModifiedBy: "Carlos Andrés Ruiz",
    history: [
      { date: "2026-07-19", user: "Carlos Andrés Ruiz", description: "Stock mínimo ajustado de 4 a 5 unidades" },
    ],
    movement: movementSeries(97),
  },
  {
    id: "p7",
    code: "SERV-5010",
    name: "Plan de Soporte Técnico Anual",
    price: 1500000,
    cost: 600000,
    iva: 0,
    stockMin: 0,
    stock: 999,
    category: "Servicios",
    estado: "active",
    createdAt: "2024-02-01",
    lastModifiedAt: "2026-04-10",
    lastModifiedBy: "María Fernanda Gómez",
    history: [],
    movement: movementSeries(113),
  },
  {
    id: "p8",
    code: "HOGA-3088",
    name: "Aspiradora Robótica Smart",
    price: 890000,
    cost: 610000,
    iva: 19,
    stockMin: 8,
    stock: 15,
    category: "Hogar",
    estado: "inactive",
    createdAt: "2022-09-30",
    lastModifiedAt: "2025-11-15",
    lastModifiedBy: "Carlos Andrés Ruiz",
    history: [
      { date: "2025-11-15", user: "Carlos Andrés Ruiz", description: "Producto inactivado por descontinuación" },
    ],
    movement: movementSeries(131),
  },
]

/* ------------------------------------------------------------------ */
/* MÓDULO 3 · PEDIDOS                                                  */
/* ------------------------------------------------------------------ */

export type PedidoStatus = "BORRADOR" | "CONFIRMADO" | "FACTURADO" | "PAGADO" | "CANCELADO"

export const pedidoStatuses: PedidoStatus[] = [
  "BORRADOR",
  "CONFIRMADO",
  "FACTURADO",
  "PAGADO",
  "CANCELADO",
]

export interface OrderLine {
  productId: string
  code: string
  name: string
  category: ProductCategory
  price: number
  /** IVA percentage applied to this line. */
  iva: number
  quantity: number
}

export interface Pedido {
  id: string
  clientId: string
  clientName: string
  clientNit: string
  createdAt: string
  status: PedidoStatus
  lines: OrderLine[]
  invoiceId?: string
  cancelReason?: string
  cancelledAt?: string
}

export interface OrderTotals {
  subtotal: number
  iva: number
  total: number
}

export function orderTotals(lines: OrderLine[]): OrderTotals {
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  const iva = lines.reduce((s, l) => s + l.price * l.quantity * (l.iva / 100), 0)
  return { subtotal, iva, total: subtotal + iva }
}

/** Build an order line from a seed product id and quantity. */
function line(productId: string, quantity: number): OrderLine {
  const p = products.find((x) => x.id === productId)!
  return {
    productId: p.id,
    code: p.code,
    name: p.name,
    category: p.category,
    price: p.price,
    iva: p.iva,
    quantity,
  }
}

export const pedidos: Pedido[] = [
  {
    id: "PED-00123",
    clientId: "c1",
    clientName: "Comercializadora Andina S.A.S.",
    clientNit: "900123456-7",
    createdAt: "2026-09-12",
    status: "BORRADOR",
    lines: [line("p1", 2), line("p5", 4)],
  },
  {
    id: "PED-00122",
    clientId: "c4",
    clientName: "Tecnología Global Corp.",
    clientNit: "800567123-9",
    createdAt: "2026-09-10",
    status: "CONFIRMADO",
    lines: [line("p4", 3), line("p6", 1)],
  },
  {
    id: "PED-00121",
    clientId: "c2",
    clientName: "Logística del Pacífico Ltda.",
    clientNit: "830098765-1",
    createdAt: "2026-09-05",
    status: "FACTURADO",
    invoiceId: "FAC-2044",
    lines: [line("p2", 5), line("p1", 1)],
  },
  {
    id: "PED-00120",
    clientId: "c5",
    clientName: "Agroindustrias del Llano S.A.S.",
    clientNit: "901889002-4",
    createdAt: "2026-08-28",
    status: "PAGADO",
    invoiceId: "FAC-2039",
    lines: [line("p7", 1)],
  },
  {
    id: "PED-00119",
    clientId: "c1",
    clientName: "Comercializadora Andina S.A.S.",
    clientNit: "900123456-7",
    createdAt: "2026-08-20",
    status: "CANCELADO",
    cancelReason: "El cliente solicitó anular el pedido por cambio de presupuesto.",
    cancelledAt: "2026-08-22",
    lines: [line("p4", 2)],
  },
  {
    id: "PED-00118",
    clientId: "c4",
    clientName: "Tecnología Global Corp.",
    clientNit: "800567123-9",
    createdAt: "2026-08-14",
    status: "PAGADO",
    invoiceId: "FAC-2031",
    lines: [line("p6", 2), line("p5", 6)],
  },
]

export function nextPedidoId(existing: Pedido[]): string {
  const max = existing.reduce((m, p) => {
    const n = Number.parseInt(p.id.replace(/\D/g, ""), 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `PED-${String(max + 1).padStart(5, "0")}`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso))
}
