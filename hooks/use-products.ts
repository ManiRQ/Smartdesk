"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ValidationIssue } from "@/lib/api/http";
import {
  createProductRequest,
  deleteProductRequest,
  fetchAllProducts,
  type ApiFailure,
  updateProductRequest,
} from "@/lib/products/api-client";
import type { ProductInput } from "@/lib/products/model";
import type { ProductResponse } from "@/lib/products/product-response";
import {
  IMPORT_FLAG_KEY,
  planLocalImport,
  PRODUCTS_STORAGE_KEY,
  runLocalImport,
} from "@/lib/products/local-import";
import { SKU_TAKEN_MESSAGE } from "@/lib/products/validation";

export type ProductsStatus = "loading" | "ready" | "error";

export type MutationResult =
  | { ok: true }
  | { ok: false; message: string; issues: ValidationIssue[] };

type CatalogueState = {
  status: ProductsStatus;
  products: ProductResponse[];
  errorMessage: string;
  importMessage: string | null;
};

const LIST_FAILURE_MESSAGE =
  "Products could not be loaded. Check your connection and try again.";
const MISSING_PRODUCT_MESSAGE =
  "This product no longer exists. Refresh the list and try again.";
const CHECK_FIELDS_MESSAGE = "Check the highlighted fields.";
const IMPORT_READ_MESSAGE =
  "Saved browser products could not be read, so nothing was imported.";
const IMPORT_PAUSED_MESSAGE =
  "Import paused because the product service was unavailable. It will retry on your next visit.";

// The browser import runs once per page load, even when effects run twice.
let browserImportRun: Promise<string | null> | null = null;

function importBrowserProductsOnce(): Promise<string | null> {
  browserImportRun ??= runBrowserImport();
  return browserImportRun;
}

async function runBrowserImport(): Promise<string | null> {
  if (window.localStorage.getItem(IMPORT_FLAG_KEY) !== null) {
    return null;
  }

  let plan: ReturnType<typeof planLocalImport>;
  try {
    plan = planLocalImport(window.localStorage.getItem(PRODUCTS_STORAGE_KEY));
  } catch (error) {
    console.error("Browser products could not be read for import", error);
    return IMPORT_READ_MESSAGE;
  }

  const summary = await runLocalImport(plan.candidates, createProductRequest);
  if (summary.interrupted) {
    return IMPORT_PAUSED_MESSAGE;
  }
  window.localStorage.setItem(IMPORT_FLAG_KEY, new Date().toISOString());

  if (plan.candidates.length === 0 && plan.invalidCount === 0) {
    return null;
  }
  return `Imported ${summary.imported} products from this browser. Skipped ${summary.duplicates} with a duplicate SKU and ${summary.rejected + plan.invalidCount} with invalid data.`;
}

type CatalogueSetter = Dispatch<SetStateAction<CatalogueState>>;

// State is set only after the network calls finish, never synchronously in the effect.
async function loadCatalogue(setState: CatalogueSetter): Promise<void> {
  let importMessage: string | null = null;
  try {
    importMessage = await importBrowserProductsOnce();
  } catch (error) {
    console.error("Browser product import failed", error);
    importMessage = IMPORT_READ_MESSAGE;
  }

  const listed = await fetchAllProducts();
  if (!listed.ok) {
    setState({
      status: "error",
      products: [],
      errorMessage: LIST_FAILURE_MESSAGE,
      importMessage: null,
    });
    return;
  }
  setState({
    status: "ready",
    products: listed.value,
    errorMessage: "",
    importMessage,
  });
}

function toMutationFailure(failure: ApiFailure): MutationResult {
  switch (failure.kind) {
    case "validation":
      return { ok: false, message: CHECK_FIELDS_MESSAGE, issues: failure.issues };
    case "duplicate-sku":
      return {
        ok: false,
        message: CHECK_FIELDS_MESSAGE,
        issues: [{ field: "sku", message: SKU_TAKEN_MESSAGE }],
      };
    case "not-found":
      return { ok: false, message: MISSING_PRODUCT_MESSAGE, issues: [] };
    case "unavailable":
      return { ok: false, message: LIST_FAILURE_MESSAGE, issues: [] };
  }
}

export function useProducts() {
  const [state, setState] = useState<CatalogueState>({
    status: "loading",
    products: [],
    errorMessage: "",
    importMessage: null,
  });

  useEffect(() => {
    void loadCatalogue(setState);
  }, []);

  const reload = useCallback(() => {
    setState((current) => ({ ...current, status: "loading" }));
    void loadCatalogue(setState);
  }, []);

  const dismissImportMessage = useCallback(() => {
    setState((current) => ({ ...current, importMessage: null }));
  }, []);

  async function addProduct(input: ProductInput): Promise<MutationResult> {
    const result = await createProductRequest(input);
    if (!result.ok) {
      return toMutationFailure(result.failure);
    }
    const created = result.value;
    setState((current) => ({
      ...current,
      products: [...current.products, created],
    }));
    return { ok: true };
  }

  async function updateProduct(
    id: string,
    input: ProductInput,
  ): Promise<MutationResult> {
    const result = await updateProductRequest(id, input);
    if (!result.ok) {
      return toMutationFailure(result.failure);
    }
    const updated = result.value;
    setState((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === id ? updated : product,
      ),
    }));
    return { ok: true };
  }

  async function deleteProduct(id: string): Promise<MutationResult> {
    const result = await deleteProductRequest(id);
    if (!result.ok) {
      return toMutationFailure(result.failure);
    }
    setState((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== id),
    }));
    return { ok: true };
  }

  return {
    products: state.products,
    status: state.status,
    errorMessage: state.errorMessage,
    importMessage: state.importMessage,
    dismissImportMessage,
    reload,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
