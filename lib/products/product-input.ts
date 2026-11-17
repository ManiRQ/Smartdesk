import type { ValidationIssue } from "@/lib/api/http";
import {
  isProductCategory,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/lib/products/model";

export type ProductDraft = {
  name: string;
  sku: string;
  skuKey: string;
  category: ProductCategory;
  costPriceCents: number;
  sellingPriceCents: number;
  reorderLevel: number;
};

export type ProductPatch = Partial<ProductDraft>;

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };

type Parsed<T> = { value: T } | { message: string };
type FieldParser<T> = (raw: unknown) => Parsed<T>;

const FIELD_NAMES = [
  "name",
  "sku",
  "category",
  "costPrice",
  "sellingPrice",
  "reorderLevel",
] as const;
const MAX_NAME_LENGTH = 200;
const MAX_SKU_LENGTH = 64;
const MAX_PRICE = 1_000_000;
const MAX_REORDER_LEVEL = 1_000_000;

export function normalizeSkuKey(sku: string): string {
  return sku.trim().toUpperCase();
}

function parseText(raw: unknown, maxLength: number): Parsed<string> {
  if (typeof raw !== "string") {
    return { message: "Must be text." };
  }
  const value = raw.trim();
  if (value === "") {
    return { message: "Must not be empty." };
  }
  if (value.length > maxLength) {
    return { message: `Must be ${maxLength} characters or fewer.` };
  }
  return { value };
}

function parseCategory(raw: unknown): Parsed<ProductCategory> {
  if (isProductCategory(raw)) {
    return { value: raw };
  }
  return { message: `Must be one of: ${PRODUCT_CATEGORIES.join(", ")}.` };
}

function parsePriceToCents(raw: unknown): Parsed<number> {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return { message: "Must be a number." };
  }
  if (raw < 0) {
    return { message: "Cannot be negative." };
  }
  if (raw > MAX_PRICE) {
    return { message: `Must be ${MAX_PRICE} or less.` };
  }
  const cents = Math.round(raw * 100);
  if (Math.abs(cents - raw * 100) > 1e-6) {
    return { message: "Must have at most two decimal places." };
  }
  return { value: cents };
}

function parseReorderLevel(raw: unknown): Parsed<number> {
  if (typeof raw !== "number" || !Number.isInteger(raw)) {
    return { message: "Must be a whole number." };
  }
  if (raw < 0) {
    return { message: "Cannot be negative." };
  }
  if (raw > MAX_REORDER_LEVEL) {
    return { message: `Must be ${MAX_REORDER_LEVEL} or less.` };
  }
  return { value: raw };
}

function readField<T>(
  record: Record<string, unknown>,
  field: string,
  mode: "create" | "update",
  parser: FieldParser<T>,
  issues: ValidationIssue[],
): T | undefined {
  const raw = record[field];
  if (raw === undefined) {
    if (mode === "create") {
      issues.push({ field, message: `${field} is required.` });
    }
    return undefined;
  }
  const parsed = parser(raw);
  if ("message" in parsed) {
    issues.push({ field, message: parsed.message });
    return undefined;
  }
  return parsed.value;
}

export function parseProductBody(
  body: unknown,
  mode: "create" | "update",
): ParseResult<ProductPatch> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return {
      ok: false,
      issues: [{ field: "body", message: "Must be a JSON object." }],
    };
  }

  const record = body as Record<string, unknown>;
  const issues: ValidationIssue[] = Object.keys(record)
    .filter((key) => !(FIELD_NAMES as readonly string[]).includes(key))
    .map((key) => ({ field: key, message: "Unknown field." }));

  const name = readField(record, "name", mode, (raw) => parseText(raw, MAX_NAME_LENGTH), issues);
  const sku = readField(record, "sku", mode, (raw) => parseText(raw, MAX_SKU_LENGTH), issues);
  const category = readField(record, "category", mode, parseCategory, issues);
  const costPriceCents = readField(record, "costPrice", mode, parsePriceToCents, issues);
  const sellingPriceCents = readField(record, "sellingPrice", mode, parsePriceToCents, issues);
  const reorderLevel = readField(record, "reorderLevel", mode, parseReorderLevel, issues);

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const value: ProductPatch = {};
  if (name !== undefined) value.name = name;
  if (sku !== undefined) {
    value.sku = sku;
    value.skuKey = normalizeSkuKey(sku);
  }
  if (category !== undefined) value.category = category;
  if (costPriceCents !== undefined) value.costPriceCents = costPriceCents;
  if (sellingPriceCents !== undefined) value.sellingPriceCents = sellingPriceCents;
  if (reorderLevel !== undefined) value.reorderLevel = reorderLevel;

  if (mode === "update" && Object.keys(value).length === 0) {
    return {
      ok: false,
      issues: [{ field: "body", message: "Provide at least one product field to update." }],
    };
  }
  return { ok: true, value };
}

function isCompleteDraft(patch: ProductPatch): patch is ProductDraft {
  return (
    patch.name !== undefined &&
    patch.sku !== undefined &&
    patch.skuKey !== undefined &&
    patch.category !== undefined &&
    patch.costPriceCents !== undefined &&
    patch.sellingPriceCents !== undefined &&
    patch.reorderLevel !== undefined
  );
}

export function parseCreateBody(body: unknown): ParseResult<ProductDraft> {
  const result = parseProductBody(body, "create");
  if (!result.ok) {
    return result;
  }
  const value = result.value;
  if (!isCompleteDraft(value)) {
    return {
      ok: false,
      issues: [{ field: "body", message: "Missing product fields." }],
    };
  }
  return { ok: true, value };
}

export function parseUpdateBody(body: unknown): ParseResult<ProductPatch> {
  return parseProductBody(body, "update");
}
