import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/products/model";
import {
  ProductStorageError,
  parseStoredProducts,
  serializeProducts,
} from "@/lib/products/storage";

const PRODUCT: Product = {
  id: "3f1c9a2e-8b7d-4c1a-9e2f-6a5b4c3d2e1f",
  name: "A4 Notebook",
  sku: "NB-A4-01",
  category: "Stationery",
  costPrice: 1.25,
  sellingPrice: 3,
  reorderLevel: 10,
};

describe("product storage", () => {
  it("returns an empty list when nothing has been saved", () => {
    expect(parseStoredProducts(null)).toEqual([]);
  });

  it("reads back exactly what was serialized", () => {
    expect(parseStoredProducts(serializeProducts([PRODUCT]))).toEqual([
      PRODUCT,
    ]);
  });

  it("rejects saved data that is not valid JSON", () => {
    expect(() => parseStoredProducts("{not json")).toThrow(
      ProductStorageError,
    );
  });

  it("rejects saved data that is not an array", () => {
    expect(() => parseStoredProducts(JSON.stringify({ id: "x" }))).toThrow(
      ProductStorageError,
    );
  });

  it("rejects stored records with invalid values", () => {
    const invalidRecords = [
      { ...PRODUCT, costPrice: -1 },
      { ...PRODUCT, reorderLevel: 2.5 },
      { ...PRODUCT, category: "Furniture" },
      { ...PRODUCT, id: "" },
    ];

    for (const record of invalidRecords) {
      expect(() => parseStoredProducts(JSON.stringify([record]))).toThrow(
        ProductStorageError,
      );
    }
  });
});
