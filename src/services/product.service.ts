import type { QueryOptions } from "@/lib/pagination";
import type { Product, ProductDto } from "@/types/product";
import type { Uom } from "@/types/uom";

import { BaseService } from "./base.service";
import { uomService } from "./uom.service";

class ProductService extends BaseService<"api/v1/products"> {
  constructor() {
    super("api/v1/products");
  }

  list(options?: QueryOptions) {
    return super.list<Product>(options);
  }

  show(id: number) {
    return super.show<Product>(id);
  }

  create(payload: ProductDto) {
    return super.create<ProductDto, Product>(payload);
  }

  update(id: number, payload: ProductDto) {
    return super.update<ProductDto, Product>(id, payload);
  }

  destroy(id: number) {
    return super.delete<void>(id);
  }

  async uomsForSelect() {
    const result = await uomService.list({ perPage: 100 });
    return result.data as Uom[];
  }
}

export const productService = new ProductService();
