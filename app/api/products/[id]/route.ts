import {
  errorResponse,
  failureResponse,
  readJsonBody,
  validationFailure,
} from "@/lib/api/http";
import { parseUpdateBody } from "@/lib/products/product-input";
import { toProductResponse } from "@/lib/products/product-response";
import {
  deleteProduct,
  findProductById,
  updateProduct,
} from "@/lib/products/repository";

type RouteContext = { params: Promise<{ id: string }> };

function productNotFound(): Response {
  return errorResponse(404, "NOT_FOUND", "Product not found.");
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const product = await findProductById(id);
    return product
      ? Response.json(toProductResponse(product))
      : productNotFound();
  } catch (error) {
    return failureResponse(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }
  const parsed = parseUpdateBody(body.value);
  if (!parsed.ok) {
    return validationFailure(parsed.issues);
  }
  try {
    const product = await updateProduct(id, parsed.value);
    return product
      ? Response.json(toProductResponse(product))
      : productNotFound();
  } catch (error) {
    return failureResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const deleted = await deleteProduct(id);
    return deleted ? new Response(null, { status: 204 }) : productNotFound();
  } catch (error) {
    return failureResponse(error);
  }
}
