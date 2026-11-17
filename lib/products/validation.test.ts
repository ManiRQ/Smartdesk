import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/products/model";
import {
  EMPTY_PRODUCT_FORM,
  type ProductFormValues,
  validateProductForm,
} from "@/lib/products/validation";

const VALID_VALUES: ProductFormValues = {
  name: "USB-C Cable",
  sku: "CAB-001",
  category: "Electronics",
  costPrice: "4.5",
  sellingPrice: "9.99",
  reorderLevel: "20",
};

const EXISTING_PRODUCTS: Product[] = [
  {
    id: "product-1",
    name: "Coffee Mug",
    sku: "MUG-01",
    category: "Other",
    costPrice: 2,
    sellingPrice: 5,
    reorderLevel: 3,
  },
];

describe("validateProductForm", () => {
  it("accepts a valid product and trims text fields", () => {
    const result = validateProductForm(
      { ...VALID_VALUES, name: "  USB-C Cable  ", sku: " CAB-001 " },
      [],
      null,
    );

    expect(result.errors).toEqual({});
    expect(result.input).toEqual({
      name: "USB-C Cable",
      sku: "CAB-001",
      category: "Electronics",
      costPrice: 4.5,
      sellingPrice: 9.99,
      reorderLevel: 20,
    });
  });

  it("requires every field when the form is empty", () => {
    const result = validateProductForm(EMPTY_PRODUCT_FORM, [], null);

    expect(result.input).toBeNull();
    expect(Object.keys(result.errors).sort()).toEqual([
      "category",
      "costPrice",
      "name",
      "reorderLevel",
      "sellingPrice",
      "sku",
    ]);
  });

  it("rejects a SKU already used by another product, ignoring case and spaces", () => {
    const result = validateProductForm(
      { ...VALID_VALUES, sku: "  mug-01 " },
      EXISTING_PRODUCTS,
      null,
    );

    expect(result.input).toBeNull();
    expect(result.errors.sku).toBe(
      "This SKU is already used by another product.",
    );
  });

  it("lets a product keep its own SKU when editing", () => {
    const result = validateProductForm(
      { ...VALID_VALUES, sku: "mug-01" },
      EXISTING_PRODUCTS,
      "product-1",
    );

    expect(result.errors).toEqual({});
    expect(result.input).not.toBeNull();
  });

  it("rejects negative prices", () => {
    const result = validateProductForm(
      { ...VALID_VALUES, costPrice: "-1", sellingPrice: "-0.5" },
      [],
      null,
    );

    expect(result.input).toBeNull();
    expect(result.errors.costPrice).toBe("Cost price cannot be negative.");
    expect(result.errors.sellingPrice).toBe("Selling price cannot be negative.");
  });

  it("rejects prices that are not numbers", () => {
    const result = validateProductForm(
      { ...VALID_VALUES, sellingPrice: "abc" },
      [],
      null,
    );

    expect(result.input).toBeNull();
    expect(result.errors.sellingPrice).toBe(
      "Enter a valid amount, such as 12.50.",
    );
  });

  it("accepts zero prices and a zero reorder level", () => {
    const result = validateProductForm(
      { ...VALID_VALUES, costPrice: "0", sellingPrice: "0", reorderLevel: "0" },
      [],
      null,
    );

    expect(result.errors).toEqual({});
    expect(result.input?.reorderLevel).toBe(0);
  });

  it("rejects a negative or decimal reorder level", () => {
    const negative = validateProductForm(
      { ...VALID_VALUES, reorderLevel: "-2" },
      [],
      null,
    );
    const decimal = validateProductForm(
      { ...VALID_VALUES, reorderLevel: "2.5" },
      [],
      null,
    );

    expect(negative.errors.reorderLevel).toBe(
      "Reorder level cannot be negative.",
    );
    expect(decimal.errors.reorderLevel).toBe(
      "Reorder level must be a whole number.",
    );
    expect(decimal.input).toBeNull();
  });

  it("rejects a category outside the allowed list", () => {
    const result = validateProductForm(
      { ...VALID_VALUES, category: "Furniture" },
      [],
      null,
    );

    expect(result.input).toBeNull();
    expect(result.errors.category).toBe("Select a category.");
  });
});
