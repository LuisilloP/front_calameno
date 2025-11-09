// Tipos para la API de FastAPI
export interface MovimientoAPI {
  id: number;
  created_at: string;
  tipo: "INGRESO" | "EGRESO" | "MOVIMIENTO";
  cantidad: number;
  producto_id: number;
  from_locacion_id?: number | null;
  to_locacion_id?: number | null;
  persona_id?: number | null;
  proveedor_id?: number | null;
  nota?: string | null;
}

export interface ProductoAPI {
  id: number;
  nombre: string;
  sku?: string | null;
  categoria_id?: number | null;
  marca_id?: number | null;
  uom_id?: number | null;
  activo: boolean;
}

export interface LocacionAPI {
  id: number;
  nombre: string;
  activa: boolean;
}

export interface PersonaAPI {
  id: number;
  nombre: string;
  apellidos?: string | null;
  area?: string | null;
}

export interface ProveedorAPI {
  id: number;
  nombre: string;
}

// Tipos para el dashboard
export interface MovimientoEnriquecido {
  id: number;
  fecha: string;
  fecha_local: string;
  producto_id: number;
  producto_nombre: string;
  sku?: string;
  tipo: "INGRESO" | "EGRESO" | "MOVIMIENTO";
  cantidad: number;
  stock_calculado?: number | null;
  from_locacion_id?: number | null;
  from_locacion_nombre?: string | null;
  to_locacion_id?: number | null;
  to_locacion_nombre?: string | null;
  persona_id?: number | null;
  persona_nombre?: string | null;
  proveedor_id?: number | null;
  proveedor_nombre?: string | null;
  nota?: string | null;
}

export interface ChartData {
  period: string;
  labels: string[];
  values: number[];
  items: Array<{
    producto_id: number;
    producto_nombre: string;
    sku?: string;
    stock_calculado?: number;
    total_ingresos?: number;
    total_egresos?: number;
    total_egresos_periodo?: number;
    avg_weekly?: number;
    umbral_critico?: number;
    umbral_bajo?: number;
    umbral_normal?: number;
  }>;
}

export interface DashboardResponse {
  meta: {
    fetched_at: string;
    week_start: string;
    week_end: string;
    count_items: number;
    tz: string;
  };
  items: MovimientoEnriquecido[];
  charts: {
    bar_one: ChartData;
    bar_two: ChartData;
  };
  endpoints_called: string[];
}

const API_BASE_URL = "http://localhost:8000/api/v1";

// Umbrales por defecto
const UMBRAL_CRITICO = 5;
const UMBRAL_BAJO = 10;
const UMBRAL_NORMAL = 15;

export class DashboardService {
  private static endpointsCalled: string[] = [];

  private static async fetchAPI<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    this.endpointsCalled.push(url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  private static getWeekBounds(offsetWeeks: number = 0): {
    start: Date;
    end: Date;
  } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff + offsetWeeks * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { start: weekStart, end: weekEnd };
  }

  private static parseCantidad(value: any): number {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;

    const normalized = value
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .replace(/[^\d.-]/g, "");

    return parseFloat(normalized) || 0;
  }

  private static formatDateLocal(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month} ${hours}:${minutes}`;
  }

  /**
   * Calcula el stock actual de cada producto sumando INGRESOS y restando EGRESOS
   */
  private static calcularStocksPorProducto(
    movimientos: MovimientoAPI[]
  ): Map<number, { stock: number; ingresos: number; egresos: number }> {
    const stockMap = new Map<
      number,
      { stock: number; ingresos: number; egresos: number }
    >();

    // Ordenar movimientos por fecha (más antiguos primero)
    const movimientosOrdenados = [...movimientos].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // DEBUG: Log de movimientos antes de procesar
    console.log("📊 CALCULAR STOCKS - DEBUG:");
    console.log(
      "Total movimientos para calcular:",
      movimientosOrdenados.length
    );
    console.log(
      "Primeros 3 movimientos raw:",
      movimientosOrdenados.slice(0, 3)
    );
    console.log("Tipos únicos encontrados:", [
      ...new Set(movimientosOrdenados.map((m) => m.tipo)),
    ]);
    console.log(
      "Cantidades de primeros 3:",
      movimientosOrdenados.slice(0, 3).map((m) => ({
        id: m.id,
        cantidad_raw: m.cantidad,
        type_cantidad: typeof m.cantidad,
      }))
    );

    movimientosOrdenados.forEach((mov, index) => {
      // DEBUG: Log detallado de cada movimiento
      console.log(`\n🔍 Movimiento #${index + 1} (ID: ${mov.id}):`);
      console.log(`  - tipo: '${mov.tipo}' (type: ${typeof mov.tipo})`);
      console.log(
        `  - cantidad raw: ${mov.cantidad} (type: ${typeof mov.cantidad})`
      );

      const cantidad = this.parseCantidad(mov.cantidad);
      console.log(`  - cantidad parsed: ${cantidad}`);

      const current = stockMap.get(mov.producto_id) || {
        stock: 0,
        ingresos: 0,
        egresos: 0,
      };

      console.log(`  - stock_antes: ${current.stock}`);
      console.log(`  - ingresos_antes: ${current.ingresos}`);
      console.log(`  - egresos_antes: ${current.egresos}`);

      // Sumar o restar según el tipo (la API devuelve 'ingreso' y 'uso' en minúsculas)
      let operacion = "NINGUNA";
      const tipoLower = mov.tipo.toLowerCase();

      if (tipoLower === "ingreso") {
        current.stock += cantidad;
        current.ingresos += cantidad;
        operacion = "✅ INGRESO aplicado";
      } else if (tipoLower === "uso" || tipoLower === "egreso") {
        current.stock -= cantidad;
        current.egresos += cantidad;
        operacion = "❌ EGRESO/USO aplicado";
      } else {
        operacion = `⚠️ Tipo '${mov.tipo}' NO RECONOCIDO`;
      }

      console.log(`  - Operación: ${operacion}`);
      console.log(`  - stock_despues: ${current.stock}`);
      console.log(`  - ingresos_despues: ${current.ingresos}`);
      console.log(`  - egresos_despues: ${current.egresos}`);

      stockMap.set(mov.producto_id, current);
    });

    console.log("Stocks finales calculados:", stockMap);

    return stockMap;
  }

  static async getDashboardData(
    weekOffset: number = 0
  ): Promise<DashboardResponse> {
    this.endpointsCalled = [];

    try {
      const { start: weekStart, end: weekEnd } = this.getWeekBounds(weekOffset);

      // 1. Obtener TODOS los movimientos para calcular stocks
      console.log("Fetching todos los movimientos...");
      const todosMovimientos = await this.fetchAPI<MovimientoAPI[]>(
        "/movimientos/"
      );

      console.log("Total movimientos recibidos:", todosMovimientos.length);
      console.log("Primeros 3 movimientos:", todosMovimientos.slice(0, 3));

      if (!Array.isArray(todosMovimientos)) {
        throw new Error("La respuesta de movimientos no es un array");
      }

      // 2. Calcular stocks actuales por producto
      const stocksPorProducto =
        this.calcularStocksPorProducto(todosMovimientos);

      console.log(
        "Stocks calculados:",
        Array.from(stocksPorProducto.entries())
      );

      // 3. Obtener últimos 10 movimientos para la tabla
      const movimientosRecientes = [...todosMovimientos]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 10);

      // 4. Extraer IDs únicos
      const productoIds = [
        ...new Set(todosMovimientos.map((m) => m.producto_id)),
      ];
      const locacionIds = [
        ...new Set(
          [
            ...todosMovimientos.map((m) => m.from_locacion_id),
            ...todosMovimientos.map((m) => m.to_locacion_id),
          ].filter((id): id is number => id !== null && id !== undefined)
        ),
      ];
      const personaIds = [
        ...new Set(
          todosMovimientos
            .map((m) => m.persona_id)
            .filter((id): id is number => id !== null && id !== undefined)
        ),
      ];
      const proveedorIds = [
        ...new Set(
          todosMovimientos
            .map((m) => m.proveedor_id)
            .filter((id): id is number => id !== null && id !== undefined)
        ),
      ];

      // 5. Obtener datos maestros
      console.log("Fetching productos...");
      const productos = await this.fetchAPI<ProductoAPI[]>("/productos/");
      const productosMap = new Map(
        Array.isArray(productos) ? productos.map((p) => [p.id, p]) : []
      );

      console.log("Fetching locaciones...");
      const locaciones = await this.fetchAPI<LocacionAPI[]>("/locaciones/");
      const locacionesMap = new Map(
        Array.isArray(locaciones) ? locaciones.map((l) => [l.id, l]) : []
      );

      console.log("Fetching personas...");
      const personas = await this.fetchAPI<PersonaAPI[]>("/personas/");
      const personasMap = new Map(
        Array.isArray(personas) ? personas.map((p) => [p.id, p]) : []
      );

      console.log("Fetching proveedores...");
      const proveedores = await this.fetchAPI<ProveedorAPI[]>("/proveedores/");
      const proveedoresMap = new Map(
        Array.isArray(proveedores) ? proveedores.map((p) => [p.id, p]) : []
      );

      // 6. Enriquecer movimientos recientes
      const itemsEnriquecidos: MovimientoEnriquecido[] =
        movimientosRecientes.map((mov) => {
          const producto = productosMap.get(mov.producto_id);
          const fromLoc = mov.from_locacion_id
            ? locacionesMap.get(mov.from_locacion_id)
            : null;
          const toLoc = mov.to_locacion_id
            ? locacionesMap.get(mov.to_locacion_id)
            : null;
          const persona = mov.persona_id
            ? personasMap.get(mov.persona_id)
            : null;
          const proveedor = mov.proveedor_id
            ? proveedoresMap.get(mov.proveedor_id)
            : null;

          const cantidad = this.parseCantidad(mov.cantidad);
          const stockInfo = stocksPorProducto.get(mov.producto_id);

          return {
            id: mov.id,
            fecha: mov.created_at,
            fecha_local: this.formatDateLocal(mov.created_at),
            producto_id: mov.producto_id,
            producto_nombre: producto?.nombre || "Desconocido",
            sku: producto?.sku || undefined,
            tipo: mov.tipo,
            cantidad,
            stock_calculado: stockInfo?.stock || null,
            from_locacion_id: mov.from_locacion_id || null,
            from_locacion_nombre: fromLoc?.nombre || null,
            to_locacion_id: mov.to_locacion_id || null,
            to_locacion_nombre: toLoc?.nombre || null,
            persona_id: mov.persona_id || null,
            persona_nombre: persona
              ? `${persona.nombre} ${persona.apellidos || ""}`.trim()
              : null,
            proveedor_id: mov.proveedor_id || null,
            proveedor_nombre: proveedor?.nombre || null,
            nota: mov.nota || null,
          };
        });

      // 7. Calcular bar_one: Productos con BAJO STOCK (top 7)
      const productosConStock = Array.from(stocksPorProducto.entries())
        .map(([productoId, stockInfo]) => {
          const producto = productosMap.get(productoId);
          return {
            producto_id: productoId,
            producto_nombre: producto?.nombre || "Desconocido",
            sku: producto?.sku || undefined,
            stock_calculado: stockInfo.stock,
            total_ingresos: stockInfo.ingresos,
            total_egresos: stockInfo.egresos,
            umbral_critico: UMBRAL_CRITICO,
            umbral_bajo: UMBRAL_BAJO,
            umbral_normal: UMBRAL_NORMAL,
          };
        })
        .sort((a, b) => a.stock_calculado - b.stock_calculado) // Ordenar de menor a mayor
        .slice(0, 7); // Top 7 con stock más bajo

      console.log("Productos con bajo stock:", productosConStock);

      // 8. Calcular bar_two: Productos MÁS DEMANDADOS (últimas 8 semanas)
      const fechaLimite8Semanas = new Date();
      fechaLimite8Semanas.setDate(fechaLimite8Semanas.getDate() - 56); // 8 semanas = 56 días

      const movimientos8Semanas = todosMovimientos.filter(
        (m) => new Date(m.created_at) >= fechaLimite8Semanas
      );

      const egresosPorProducto = new Map<number, number>();
      movimientos8Semanas
        .filter(
          (m) =>
            m.tipo.toLowerCase() === "uso" || m.tipo.toLowerCase() === "egreso"
        )
        .forEach((m) => {
          const cantidad = this.parseCantidad(m.cantidad);
          egresosPorProducto.set(
            m.producto_id,
            (egresosPorProducto.get(m.producto_id) || 0) + cantidad
          );
        });

      const productosMasDemandados = Array.from(egresosPorProducto.entries())
        .map(([productoId, totalEgresos]) => {
          const producto = productosMap.get(productoId);
          return {
            producto_id: productoId,
            producto_nombre: producto?.nombre || "Desconocido",
            sku: producto?.sku || undefined,
            total_egresos_periodo: totalEgresos,
            avg_weekly: totalEgresos / 8,
          };
        })
        .sort((a, b) => b.total_egresos_periodo - a.total_egresos_periodo)
        .slice(0, 7);

      console.log("Productos más demandados:", productosMasDemandados);

      return {
        meta: {
          fetched_at: new Date().toISOString(),
          week_start: weekStart.toISOString(),
          week_end: weekEnd.toISOString(),
          count_items: itemsEnriquecidos.length,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        items: itemsEnriquecidos,
        charts: {
          bar_one: {
            period: "now",
            labels: productosConStock.map((i) => i.producto_nombre),
            values: productosConStock.map((i) => i.stock_calculado),
            items: productosConStock,
          },
          bar_two: {
            period: "last_8_weeks",
            labels: productosMasDemandados.map((i) => i.producto_nombre),
            values: productosMasDemandados.map((i) => i.total_egresos_periodo),
            items: productosMasDemandados,
          },
        },
        endpoints_called: this.endpointsCalled,
      };
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      throw new Error(`Error fetching dashboard data: ${error.message}`);
    }
  }
}
