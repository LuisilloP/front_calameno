import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/axios";
import { uomService } from "@/services/uom.service";

describe("uomService", () => {
  const getSpy = vi.spyOn(api, "get");

  beforeEach(() => {
    getSpy.mockResolvedValue({
      data: {
        data: [],
        meta: {
          currentPage: 2,
          perPage: 20,
          total: 0,
          lastPage: 1,
        },
      },
    });
  });

  afterEach(() => {
    getSpy.mockReset();
  });

  it("construye correctamente la query en list", async () => {
    const result = await uomService.list({
      page: 2,
      perPage: 20,
      sort: { field: "name", order: "desc" },
      filters: { "filter[name]": "kg" },
    });

    expect(getSpy).toHaveBeenCalledWith("/api/v1/uoms?page=2&per_page=20&sort=-name&filter%5Bname%5D=kg", undefined);
    expect(result.meta.currentPage).toBe(2);
    expect(result.meta.perPage).toBe(20);
  });
});
