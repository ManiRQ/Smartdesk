import { describe, expect, it } from "vitest";
import type { ApiResult } from "@/lib/products/api-client";
import {
  planLocalImport,
  runLocalImport,
} from "@/lib/products/local-import";
import type { ProductInput } from "@/lib/products/model";
import type { ProductResponse } from "@/lib/products/product-response";

const MUG = {
  id: "a",
  name: "Mug",
  sku: "MUG-01",
  category: "Other",
  costPrice: 2,
  sellingPrice: 5,
  reorderLevel: 3,
};

const INVALID = { id: "b", name: "", sku: "BAD", category: "Other" };

const CANDIDATE: ProductInput = {
  name: "Pen",
  sku: "PEN-01",
  category: "Stationery",
  costPrice: 1,
  sellingPrice: 2,
  reorderLevel: 5,
};

const STORED_PRODUCT = { id: "server-id" } as ProductResponse;

describe("planLocalImport", () => {
  it("has nothing to import when no browser data exists", () => {
    expect(planLocalImport(null)).toEqual({ candidates: [], invalidCount: 0 });
  });

  it("keeps valid records without their ids and counts invalid ones", () => {
    const plan = planLocalImport(JSON.stringify([MUG, INVALID]));

    expect(plan.candidates).toEqual([
      {
        name: "Mug",
        sku: "MUG-01",
        category: "Other",
        costPrice: 2,
        sellingPrice: 5,
        reorderLevel: 3,
      },
    ]);
    expect(plan.invalidCount).toBe(1);
  });

  it("rejects saved data that is not a list", () => {
    expect(() => planLocalImport('{"name":"Mug"}')).toThrow();
  });

  it("rejects malformed JSON", () => {
    expect(() => planLocalImport("{bad")).toThrow();
  });
});

describe("runLocalImport", () => {
  it("counts imported, duplicate and rejected products", async () => {
    const create = async (input: ProductInput): Promise<ApiResult<ProductResponse>> => {
      if (input.sku === "DUP") {
        return { ok: false, failure: { kind: "duplicate-sku" } };
      }
      if (input.sku === "BAD") {
        return { ok: false, failure: { kind: "validation", issues: [] } };
      }
      return { ok: true, value: STORED_PRODUCT };
    };

    const summary = await runLocalImport(
      [CANDIDATE, { ...CANDIDATE, sku: "DUP" }, { ...CANDIDATE, sku: "BAD" }],
      create,
    );

    expect(summary).toEqual({
      imported: 1,
      duplicates: 1,
      rejected: 1,
      interrupted: false,
    });
  });

  it("stops and reports interruption when the service is unavailable", async () => {
    const calls: string[] = [];
    const create = async (input: ProductInput): Promise<ApiResult<ProductResponse>> => {
      calls.push(input.sku);
      if (input.sku === "PEN-01") {
        return { ok: true, value: STORED_PRODUCT };
      }
      return { ok: false, failure: { kind: "unavailable" } };
    };

    const summary = await runLocalImport(
      [CANDIDATE, { ...CANDIDATE, sku: "UNAVAILABLE" }, { ...CANDIDATE, sku: "LATER" }],
      create,
    );

    expect(calls).toEqual(["PEN-01", "UNAVAILABLE"]);
    expect(summary).toEqual({
      imported: 1,
      duplicates: 0,
      rejected: 0,
      interrupted: true,
    });
  });
});
