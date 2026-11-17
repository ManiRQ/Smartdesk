import { errorResponse } from "@/lib/api/http";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
const MAX_PAGE = 1_000_000;

export type Pagination = { page: number; pageSize: number };

export type PaginationResult =
  | { ok: true; value: Pagination }
  | { ok: false; response: Response };

function parseBoundedInteger(
  raw: string | null,
  fallback: number,
  max: number,
): number | null {
  if (raw === null || raw === "") {
    return fallback;
  }
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  const value = Number(raw);
  return value >= 1 && value <= max ? value : null;
}

export function parsePagination(searchParams: URLSearchParams): PaginationResult {
  const page = parseBoundedInteger(searchParams.get("page"), 1, MAX_PAGE);
  const pageSize = parseBoundedInteger(
    searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
  );
  if (page === null || pageSize === null) {
    return {
      ok: false,
      response: errorResponse(
        400,
        "VALIDATION_ERROR",
        `page must be an integer from 1 to ${MAX_PAGE}, and pageSize an integer from 1 to ${MAX_PAGE_SIZE}.`,
      ),
    };
  }
  return { ok: true, value: { page, pageSize } };
}
