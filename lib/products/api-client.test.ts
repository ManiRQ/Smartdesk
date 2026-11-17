import { describe, expect, it } from "vitest";
import { readFailure } from "@/lib/products/api-client";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("readFailure", () => {
  it("maps 409 to a duplicate SKU failure", async () => {
    const failure = await readFailure(
      jsonResponse(409, { error: { code: "DUPLICATE_SKU", message: "Taken." } }),
    );
    expect(failure).toEqual({ kind: "duplicate-sku" });
  });

  it("keeps field-level issues from a 400 response", async () => {
    const issues = [{ field: "sku", message: "sku is required." }];
    const failure = await readFailure(
      jsonResponse(400, {
        error: { code: "VALIDATION_ERROR", message: "Invalid.", details: issues },
      }),
    );
    expect(failure).toEqual({ kind: "validation", issues });
  });

  it("maps 404 to not found", async () => {
    const failure = await readFailure(
      jsonResponse(404, { error: { code: "NOT_FOUND", message: "Missing." } }),
    );
    expect(failure).toEqual({ kind: "not-found" });
  });

  it("treats server errors as unavailable", async () => {
    const failure = await readFailure(
      jsonResponse(500, { error: { code: "INTERNAL_ERROR", message: "Oops." } }),
    );
    expect(failure).toEqual({ kind: "unavailable" });
  });
});
