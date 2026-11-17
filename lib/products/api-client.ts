import type { ApiErrorBody, ValidationIssue } from "@/lib/api/http";
import type { ProductInput } from "@/lib/products/model";
import type { ProductResponse } from "@/lib/products/product-response";

const PRODUCTS_URL = "/api/products";
const LIST_PAGE_SIZE = 100;
const JSON_HEADERS = { "content-type": "application/json" };

export type ApiFailure =
  | { kind: "validation"; issues: ValidationIssue[] }
  | { kind: "duplicate-sku" }
  | { kind: "not-found" }
  | { kind: "unavailable" };

export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; failure: ApiFailure };

type ProductListBody = { items: ProductResponse[]; total: number };

async function readValidationIssues(
  response: Response,
): Promise<ValidationIssue[]> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return body.error.details ?? [];
  } catch (error) {
    console.error("Validation response could not be read", error);
    return [];
  }
}

export async function readFailure(response: Response): Promise<ApiFailure> {
  if (response.status === 409) {
    return { kind: "duplicate-sku" };
  }
  if (response.status === 404) {
    return { kind: "not-found" };
  }
  if (response.status === 400) {
    return {
      kind: "validation",
      issues: await readValidationIssues(response),
    };
  }
  return { kind: "unavailable" };
}

async function send(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, init);
  } catch (error) {
    console.error("Product service request failed", error);
    return null;
  }
}

function productUrl(id: string): string {
  return `${PRODUCTS_URL}/${encodeURIComponent(id)}`;
}

async function sendProduct(
  url: string,
  init: RequestInit,
): Promise<ApiResult<ProductResponse>> {
  const response = await send(url, { ...init, headers: JSON_HEADERS });
  if (response === null) {
    return { ok: false, failure: { kind: "unavailable" } };
  }
  if (!response.ok) {
    return { ok: false, failure: await readFailure(response) };
  }
  return { ok: true, value: (await response.json()) as ProductResponse };
}

export async function fetchAllProducts(): Promise<
  ApiResult<ProductResponse[]>
> {
  const products: ProductResponse[] = [];
  let total = Number.POSITIVE_INFINITY;
  let page = 1;

  while (products.length < total) {
    const response = await send(
      `${PRODUCTS_URL}?page=${page}&pageSize=${LIST_PAGE_SIZE}`,
    );
    if (response === null) {
      return { ok: false, failure: { kind: "unavailable" } };
    }
    if (!response.ok) {
      return { ok: false, failure: await readFailure(response) };
    }
    const body = (await response.json()) as ProductListBody;
    if (body.items.length === 0) {
      break;
    }
    products.push(...body.items);
    total = body.total;
    page += 1;
  }
  return { ok: true, value: products };
}

export function createProductRequest(
  input: ProductInput,
): Promise<ApiResult<ProductResponse>> {
  return sendProduct(PRODUCTS_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProductRequest(
  id: string,
  input: ProductInput,
): Promise<ApiResult<ProductResponse>> {
  return sendProduct(productUrl(id), {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteProductRequest(
  id: string,
): Promise<ApiResult<null>> {
  const response = await send(productUrl(id), { method: "DELETE" });
  if (response === null) {
    return { ok: false, failure: { kind: "unavailable" } };
  }
  if (!response.ok) {
    return { ok: false, failure: await readFailure(response) };
  }
  return { ok: true, value: null };
}
