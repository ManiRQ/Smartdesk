import { isProductCategory, type Product } from "@/lib/products/model";

export const PRODUCTS_STORAGE_KEY = "stockpilot.products.v1";

export class ProductStorageError extends Error {}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isStoredProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    record.id !== "" &&
    typeof record.name === "string" &&
    typeof record.sku === "string" &&
    isProductCategory(record.category) &&
    isNonNegativeNumber(record.costPrice) &&
    isNonNegativeNumber(record.sellingPrice) &&
    isNonNegativeNumber(record.reorderLevel) &&
    Number.isInteger(record.reorderLevel)
  );
}

export function parseStoredProducts(raw: string | null): Product[] {
  if (raw === null) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new ProductStorageError("Saved product data is not valid JSON.", {
      cause: error,
    });
  }

  if (!Array.isArray(parsed) || !parsed.every(isStoredProduct)) {
    throw new ProductStorageError(
      "Saved product data has an unexpected shape.",
    );
  }
  return parsed;
}

export function serializeProducts(products: readonly Product[]): string {
  return JSON.stringify(products);
}
