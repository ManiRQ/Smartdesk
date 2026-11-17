import { beforeEach, describe, expect, it } from "vitest";
import * as collectionRoute from "@/app/api/products/route";
import * as productRoute from "@/app/api/products/[id]/route";
import { db } from "@/lib/db";

const BASE_URL = "http://localhost/api/products";

type ProductBody = {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
};

type ErrorBody = {
  error: { code: string; details?: { field: string; message: string }[] };
};

const VALID_PRODUCT = {
  name: "USB-C Cable",
  sku: "CAB-001",
  category: "Electronics",
  costPrice: 4.5,
  sellingPrice: 9.99,
  reorderLevel: 20,
};

function jsonRequest(method: string, url: string, body: unknown): Request {
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function routeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function createProduct(overrides: Record<string, unknown> = {}) {
  return collectionRoute.POST(
    jsonRequest("POST", BASE_URL, { ...VALID_PRODUCT, ...overrides }),
  );
}

async function createdProduct(overrides: Record<string, unknown> = {}) {
  const response = await createProduct(overrides);
  expect(response.status).toBe(201);
  return (await response.json()) as ProductBody;
}

beforeEach(async () => {
  await db.product.deleteMany();
});

describe("POST /api/products", () => {
  it("creates a product, returns 201 and stores it in the database", async () => {
    const response = await createProduct();
    const body = (await response.json()) as ProductBody;

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      name: "USB-C Cable",
      sku: "CAB-001",
      category: "Electronics",
      costPrice: 4.5,
      sellingPrice: 9.99,
      reorderLevel: 20,
    });
    expect(response.headers.get("location")).toBe(`/api/products/${body.id}`);

    const stored = await db.product.findUnique({ where: { id: body.id } });
    expect(stored?.costPriceCents).toBe(450);
    expect(stored?.sellingPriceCents).toBe(999);
  });

  it("rejects a duplicate SKU, ignoring case and surrounding spaces", async () => {
    await createProduct();
    const response = await createProduct({ sku: "  cab-001 " });
    const body = (await response.json()) as ErrorBody;

    expect(response.status).toBe(409);
    expect(body.error.code).toBe("DUPLICATE_SKU");
    expect(await db.product.count()).toBe(1);
  });

  it("rejects missing required fields with field-level details", async () => {
    const response = await collectionRoute.POST(
      jsonRequest("POST", BASE_URL, { costPrice: 1, sellingPrice: 2, reorderLevel: 3 }),
    );
    const body = (await response.json()) as ErrorBody;
    const fields = body.error.details?.map((issue) => issue.field).sort();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(fields).toEqual(["category", "name", "sku"]);
  });

  it.each([
    ["negative cost price", { costPrice: -1 }],
    ["negative selling price", { sellingPrice: -0.5 }],
    ["more than two price decimals", { sellingPrice: 1.005 }],
    ["decimal reorder level", { reorderLevel: 2.5 }],
    ["negative reorder level", { reorderLevel: -2 }],
    ["unknown category", { category: "Furniture" }],
    ["unknown field", { stock: 10 }],
  ])("rejects invalid data: %s", async (_label, overrides) => {
    const response = await createProduct(overrides);

    expect(response.status).toBe(400);
    expect(await db.product.count()).toBe(0);
  });

  it("rejects a body that is not valid JSON", async () => {
    const response = await collectionRoute.POST(
      new Request(BASE_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not json",
      }),
    );
    const body = (await response.json()) as ErrorBody;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_JSON");
  });

  it("rejects a body that is not sent as JSON", async () => {
    const response = await collectionRoute.POST(
      new Request(BASE_URL, {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: JSON.stringify(VALID_PRODUCT),
      }),
    );

    expect(response.status).toBe(415);
  });
});

describe("GET /api/products", () => {
  it("returns an empty list when there are no products", async () => {
    const response = await collectionRoute.GET(new Request(BASE_URL));
    const body = (await response.json()) as { items: ProductBody[]; total: number };

    expect(response.status).toBe(200);
    expect(body.items).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("returns a paginated list with total and page metadata", async () => {
    await createdProduct({ sku: "A-1" });
    await createdProduct({ sku: "A-2" });
    await createdProduct({ sku: "A-3" });

    const response = await collectionRoute.GET(
      new Request(`${BASE_URL}?page=2&pageSize=2`),
    );
    const body = (await response.json()) as {
      items: ProductBody[];
      total: number;
      page: number;
      pageSize: number;
    };

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.total).toBe(3);
    expect(body.page).toBe(2);
    expect(body.pageSize).toBe(2);
  });

  it("rejects invalid pagination parameters", async () => {
    const response = await collectionRoute.GET(
      new Request(`${BASE_URL}?pageSize=500`),
    );

    expect(response.status).toBe(400);
  });
});

describe("GET /api/products/:id", () => {
  it("returns one product by id", async () => {
    const created = await createdProduct();
    const response = await productRoute.GET(
      new Request(`${BASE_URL}/${created.id}`),
      routeContext(created.id),
    );
    const body = (await response.json()) as ProductBody;

    expect(response.status).toBe(200);
    expect(body.id).toBe(created.id);
    expect(body.sku).toBe("CAB-001");
  });

  it("returns 404 for a nonexistent product id", async () => {
    const response = await productRoute.GET(
      new Request(`${BASE_URL}/missing-id`),
      routeContext("missing-id"),
    );
    const body = (await response.json()) as ErrorBody;

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});

describe("PATCH /api/products/:id", () => {
  it("updates only the provided fields and stores the new price", async () => {
    const created = await createdProduct();
    const response = await productRoute.PATCH(
      jsonRequest("PATCH", `${BASE_URL}/${created.id}`, { sellingPrice: 12.5 }),
      routeContext(created.id),
    );
    const body = (await response.json()) as ProductBody;
    const stored = await db.product.findUnique({ where: { id: created.id } });

    expect(response.status).toBe(200);
    expect(body.sellingPrice).toBe(12.5);
    expect(body.name).toBe("USB-C Cable");
    expect(stored?.sellingPriceCents).toBe(1250);
  });

  it("keeps the product's own SKU and rejects another product's SKU", async () => {
    const first = await createdProduct();
    await createdProduct({ sku: "MUG-01" });

    const sameSku = await productRoute.PATCH(
      jsonRequest("PATCH", `${BASE_URL}/${first.id}`, { sku: "cab-001" }),
      routeContext(first.id),
    );
    const takenSku = await productRoute.PATCH(
      jsonRequest("PATCH", `${BASE_URL}/${first.id}`, { sku: "mug-01" }),
      routeContext(first.id),
    );

    expect(sameSku.status).toBe(200);
    expect(takenSku.status).toBe(409);
  });

  it("rejects an empty update and invalid values", async () => {
    const created = await createdProduct();
    const empty = await productRoute.PATCH(
      jsonRequest("PATCH", `${BASE_URL}/${created.id}`, {}),
      routeContext(created.id),
    );
    const negative = await productRoute.PATCH(
      jsonRequest("PATCH", `${BASE_URL}/${created.id}`, { costPrice: -1 }),
      routeContext(created.id),
    );

    expect(empty.status).toBe(400);
    expect(negative.status).toBe(400);
  });

  it("returns 404 when updating a nonexistent product", async () => {
    const response = await productRoute.PATCH(
      jsonRequest("PATCH", `${BASE_URL}/missing-id`, { name: "Ghost" }),
      routeContext("missing-id"),
    );

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/products/:id", () => {
  it("deletes a product, returns 204 and removes it from the database", async () => {
    const created = await createdProduct();
    const response = await productRoute.DELETE(
      new Request(`${BASE_URL}/${created.id}`, { method: "DELETE" }),
      routeContext(created.id),
    );
    const followUp = await productRoute.GET(
      new Request(`${BASE_URL}/${created.id}`),
      routeContext(created.id),
    );

    expect(response.status).toBe(204);
    expect(followUp.status).toBe(404);
    expect(await db.product.count()).toBe(0);
  });

  it("returns 404 when deleting a nonexistent product", async () => {
    const response = await productRoute.DELETE(
      new Request(`${BASE_URL}/missing-id`, { method: "DELETE" }),
      routeContext("missing-id"),
    );

    expect(response.status).toBe(404);
  });
});
