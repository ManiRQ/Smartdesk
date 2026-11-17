import {
  failureResponse,
  readJsonBody,
  validationFailure,
} from "@/lib/api/http";
import { parsePagination } from "@/lib/api/pagination";
import { parseCreateBody } from "@/lib/products/product-input";
import { toProductResponse } from "@/lib/products/product-response";
import { createProduct, listProducts } from "@/lib/products/repository";

export async function GET(request: Request) {
  const pagination = parsePagination(new URL(request.url).searchParams);
  if (!pagination.ok) {
    return pagination.response;
  }
  try {
    const { items, total } = await listProducts(pagination.value);
    return Response.json({
      items: items.map(toProductResponse),
      total,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    });
  } catch (error) {
    return failureResponse(error);
  }
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }
  const parsed = parseCreateBody(body.value);
  if (!parsed.ok) {
    return validationFailure(parsed.issues);
  }
  try {
    const product = await createProduct(parsed.value);
    return Response.json(toProductResponse(product), {
      status: 201,
      headers: { Location: `/api/products/${product.id}` },
    });
  } catch (error) {
    return failureResponse(error);
  }
}
