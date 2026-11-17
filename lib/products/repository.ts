import { db } from "@/lib/db";
import type { Pagination } from "@/lib/api/pagination";
import { Prisma, type Product } from "@/lib/generated/prisma/client";
import { DuplicateSkuError } from "@/lib/products/errors";
import type { ProductDraft, ProductPatch } from "@/lib/products/product-input";

function isKnownRequestError(
  error: unknown,
  code: string,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === code
  );
}

export async function listProducts({ page, pageSize }: Pagination) {
  const [items, total] = await db.$transaction([
    db.product.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count(),
  ]);
  return { items, total };
}

export function findProductById(id: string): Promise<Product | null> {
  return db.product.findUnique({ where: { id } });
}

export async function createProduct(draft: ProductDraft): Promise<Product> {
  try {
    return await db.product.create({ data: draft });
  } catch (error) {
    if (isKnownRequestError(error, "P2002")) {
      throw new DuplicateSkuError();
    }
    throw error;
  }
}

export async function updateProduct(
  id: string,
  patch: ProductPatch,
): Promise<Product | null> {
  try {
    return await db.product.update({ where: { id }, data: patch });
  } catch (error) {
    if (isKnownRequestError(error, "P2025")) {
      return null;
    }
    if (isKnownRequestError(error, "P2002")) {
      throw new DuplicateSkuError();
    }
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await db.product.deleteMany({ where: { id } });
  return result.count > 0;
}
