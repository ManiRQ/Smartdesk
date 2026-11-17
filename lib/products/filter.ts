import type { Product, ProductCategory } from "@/lib/products/model";

export function filterProducts(
  products: readonly Product[],
  query: string,
  category: ProductCategory | "",
): Product[] {
  const needle = query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = category === "" || product.category === category;
    const matchesQuery =
      needle === "" ||
      product.name.toLowerCase().includes(needle) ||
      product.sku.toLowerCase().includes(needle);
    return matchesCategory && matchesQuery;
  });
}
