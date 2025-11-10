import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { movementsApi } from "@/services/movementsApi";

const createResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? "OK" : "Bad Request",
  json: vi.fn().mockResolvedValue(data),
});

describe("movementsApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("obtiene el catálogo de productos", async () => {
    const mockedResponse = createResponse([{ id: 1, nombre: "Manzanas" }]);
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockedResponse
    );

    const productos = await movementsApi.listProductos();
    expect(productos).toHaveLength(1);
    expect(productos[0].nombre).toBe("Manzanas");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/productos",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("crea un movimiento con el payload correcto", async () => {
    const payload = {
      tipo: "ingreso" as const,
      producto_id: 9,
      cantidad: 2.5,
      from_locacion_id: null,
      to_locacion_id: 1,
      persona_id: null,
      proveedor_id: null,
      nota: "Test",
    };

    const mockedResponse = createResponse({ id: 10, ...payload });
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockedResponse
    );

    const movimiento = await movementsApi.createMovimiento(payload);
    expect(movimiento.id).toBe(10);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/movimientos",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      })
    );
  });

  it("propaga el detalle de error del backend", async () => {
    const errorResponse = {
      detail: "Stock insuficiente",
      error_detail: "No hay stock en la locación origen",
    };
    const mockedResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: vi.fn().mockResolvedValue(errorResponse),
    };

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockedResponse
    );

    await expect(
      movementsApi.createMovimiento({
        tipo: "uso",
        producto_id: 3,
        cantidad: 1,
      })
    ).rejects.toMatchObject({
      status: 400,
      message: "Stock insuficiente",
      errorDetail: errorResponse.error_detail,
    });
  });
});
