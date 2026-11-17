import type { ProductInput } from "@/lib/products/model";
import type { ApiResult } from "@/lib/products/api-client";
import type { ProductResponse } from "@/lib/products/product-response";
import {
  parseCreateBody,
  type ProductDraft,
} from "@/lib/products/product-input";

export const PRODUCTS_STORAGE_KEY = "stockpilot.products.v1";
export const IMPORT_FLAG_KEY = "stockpilot.products.imported.v1";

export type ImportPlan = {
  candidates: ProductInput[];
  invalidCount: number;
};

export type ImportSummary = {
  imported: number;
  duplicates: number;
  rejected: number;
  interrupted: boolean;
};

function withoutId(record: unknown): unknown {
  if (typeof record !== "object" || record === null) {
    return record;
  }
  const fields = { ...(record as Record<string, unknown>) };
  delete fields.id;
  return fields;
}

function toProductInput(draft: ProductDraft): ProductInput {
  return {
    name: draft.name,
    sku: draft.sku,
    category: draft.category,
    costPrice: draft.costPriceCents / 100,
    sellingPrice: draft.sellingPriceCents / 100,
    reorderLevel: draft.reorderLevel,
  };
}

// Throws when the saved text is not a JSON list.
export function planLocalImport(raw: string | null): ImportPlan {
  if (raw === null) {
    return { candidates: [], invalidCount: 0 };
  }
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Saved product data is not a list.");
  }

  const candidates: ProductInput[] = [];
  let invalidCount = 0;
  for (const record of parsed) {
    const result = parseCreateBody(withoutId(record));
    if (result.ok) {
      candidates.push(toProductInput(result.value));
    } else {
      invalidCount += 1;
    }
  }
  return { candidates, invalidCount };
}

export async function runLocalImport(
  candidates: readonly ProductInput[],
  create: (input: ProductInput) => Promise<ApiResult<ProductResponse>>,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    imported: 0,
    duplicates: 0,
    rejected: 0,
    interrupted: false,
  };
  for (const candidate of candidates) {
    const result = await create(candidate);
    if (result.ok) {
      summary.imported += 1;
    } else if (result.failure.kind === "duplicate-sku") {
      summary.duplicates += 1;
    } else if (result.failure.kind === "validation") {
      summary.rejected += 1;
    } else {
      summary.interrupted = true;
      break;
    }
  }
  return summary;
}
