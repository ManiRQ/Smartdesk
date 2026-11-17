import type { ValidationIssue } from "@/lib/api/http";
import {
  isProductCategory,
  type Product,
  type ProductInput,
} from "@/lib/products/model";

export type ProductFormValues = {
  name: string;
  sku: string;
  category: string;
  costPrice: string;
  sellingPrice: string;
  reorderLevel: string;
};

export type ProductFieldErrors = Partial<
  Record<keyof ProductFormValues, string>
>;

export type ProductValidationResult = {
  errors: ProductFieldErrors;
  input: ProductInput | null;
};

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  sku: "",
  category: "",
  costPrice: "",
  sellingPrice: "",
  reorderLevel: "",
};

export const REQUIRED_MESSAGE = "This field is required.";
export const SKU_TAKEN_MESSAGE = "This SKU is already used by another product.";
const DECIMAL_PATTERN = /^(\d+\.?\d*|\.\d+)$/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;

export function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase();
}

function isFormField(field: string): field is keyof ProductFormValues {
  return field in EMPTY_PRODUCT_FORM;
}

// Maps API validation issues onto the form fields they belong to.
export function issuesToFieldErrors(issues: ValidationIssue[]): ProductFieldErrors {
  const errors: ProductFieldErrors = {};
  for (const issue of issues) {
    if (isFormField(issue.field)) {
      errors[issue.field] = issue.message;
    }
  }
  return errors;
}

export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    costPrice: String(product.costPrice),
    sellingPrice: String(product.sellingPrice),
    reorderLevel: String(product.reorderLevel),
  };
}

function validatePrice(rawValue: string, label: string): string | undefined {
  const value = rawValue.trim();
  if (value === "") {
    return REQUIRED_MESSAGE;
  }
  if (value.startsWith("-")) {
    return `${label} cannot be negative.`;
  }
  if (!DECIMAL_PATTERN.test(value)) {
    return "Enter a valid amount, such as 12.50.";
  }
  return undefined;
}

function validateReorderLevel(rawValue: string): string | undefined {
  const value = rawValue.trim();
  if (value === "") {
    return REQUIRED_MESSAGE;
  }
  if (value.startsWith("-")) {
    return "Reorder level cannot be negative.";
  }
  if (!WHOLE_NUMBER_PATTERN.test(value)) {
    return "Reorder level must be a whole number.";
  }
  return undefined;
}

function isSkuTaken(
  sku: string,
  products: readonly Product[],
  editingId: string | null,
): boolean {
  const normalized = normalizeSku(sku);
  return products.some(
    (product) =>
      product.id !== editingId && normalizeSku(product.sku) === normalized,
  );
}

export function validateProductForm(
  values: ProductFormValues,
  existingProducts: readonly Product[],
  editingId: string | null,
): ProductValidationResult {
  const name = values.name.trim();
  const sku = values.sku.trim();
  const category = values.category;
  const errors: ProductFieldErrors = {};

  if (name === "") {
    errors.name = REQUIRED_MESSAGE;
  }
  if (sku === "") {
    errors.sku = REQUIRED_MESSAGE;
  } else if (isSkuTaken(sku, existingProducts, editingId)) {
    errors.sku = SKU_TAKEN_MESSAGE;
  }
  if (!isProductCategory(category)) {
    errors.category = "Select a category.";
  }

  const costPriceError = validatePrice(values.costPrice, "Cost price");
  const sellingPriceError = validatePrice(values.sellingPrice, "Selling price");
  const reorderLevelError = validateReorderLevel(values.reorderLevel);
  if (costPriceError) {
    errors.costPrice = costPriceError;
  }
  if (sellingPriceError) {
    errors.sellingPrice = sellingPriceError;
  }
  if (reorderLevelError) {
    errors.reorderLevel = reorderLevelError;
  }

  if (Object.keys(errors).length > 0 || !isProductCategory(category)) {
    return { errors, input: null };
  }

  return {
    errors,
    input: {
      name,
      sku,
      category,
      costPrice: Number(values.costPrice.trim()),
      sellingPrice: Number(values.sellingPrice.trim()),
      reorderLevel: Number(values.reorderLevel.trim()),
    },
  };
}
