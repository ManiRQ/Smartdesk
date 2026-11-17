import type { Product } from "@/lib/generated/prisma/client";

export type ProductResponse = {
  id: string;
  name: string;
  sku: string;
  category: Product["category"];
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
};

export function toProductResponse(product: Product): ProductResponse {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    costPrice: product.costPriceCents / 100,
    sellingPrice: product.sellingPriceCents / 100,
    reorderLevel: product.reorderLevel,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
