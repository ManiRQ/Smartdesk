export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Grocery",
  "Stationery",
  "Other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
};

export type ProductInput = Omit<Product, "id">;

export function isProductCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === "string" &&
    (PRODUCT_CATEGORIES as readonly string[]).includes(value)
  );
}
