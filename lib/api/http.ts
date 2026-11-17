import { DuplicateSkuError } from "@/lib/products/errors";

export type ValidationIssue = { field: string; message: string };

export type ApiErrorBody = {
  error: { code: string; message: string; details?: ValidationIssue[] };
};

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: ValidationIssue[],
): Response {
  const body: ApiErrorBody = {
    error: details ? { code, message, details } : { code, message },
  };
  return Response.json(body, { status });
}

export function validationFailure(issues: ValidationIssue[]): Response {
  return errorResponse(
    400,
    "VALIDATION_ERROR",
    "The request data is invalid.",
    issues,
  );
}

export function failureResponse(error: unknown): Response {
  if (error instanceof DuplicateSkuError) {
    return errorResponse(409, "DUPLICATE_SKU", error.message);
  }
  console.error("Unhandled product API error", error);
  return errorResponse(
    500,
    "INTERNAL_ERROR",
    "Something went wrong. Try again later.",
  );
}

export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; response: Response };

export async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      response: errorResponse(
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "Request body must be JSON (Content-Type: application/json).",
      ),
    };
  }
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return {
      ok: false,
      response: errorResponse(
        400,
        "INVALID_JSON",
        "Request body is not valid JSON.",
      ),
    };
  }
}
