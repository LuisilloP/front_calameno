import type { QueryOptions } from "@/lib/pagination";
import type { Paginated } from "@/types/common";
import type { Uom, UomDto } from "@/types/uom";

import { BaseService } from "./base.service";

class UomService extends BaseService<"api/v1/uoms"> {
  constructor() {
    super("api/v1/uoms");
  }

  list(options?: QueryOptions) {
    return super.list<Uom>(options);
  }

  show(id: number) {
    return super.show<Uom>(id);
  }

  create(payload: UomDto) {
    return super.create<UomDto, Uom>(payload);
  }

  update(id: number, payload: UomDto) {
    return super.update<UomDto, Uom>(id, payload);
  }

  destroy(id: number) {
    return super.delete<void>(id);
  }
}

export const uomService = new UomService();

export type { Paginated, QueryOptions };
