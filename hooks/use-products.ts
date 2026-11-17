"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Product, ProductInput } from "@/lib/products/model";
import {
  PRODUCTS_STORAGE_KEY,
  parseStoredProducts,
  serializeProducts,
} from "@/lib/products/storage";

export type ProductsStatus = "loading" | "ready" | "error";

export type MutationResult = { ok: true } | { ok: false; message: string };

type Catalogue = {
  status: ProductsStatus;
  products: Product[];
  errorMessage: string;
};

const LOAD_FAILURE_MESSAGE =
  "Saved products could not be loaded. Try again, or clear the site data for this app.";
const SAVE_FAILURE_MESSAGE =
  "Your change could not be saved in this browser. Free up storage space and try again.";
const MISSING_PRODUCT_MESSAGE =
  "This product no longer exists. Refresh the list and try again.";

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
}

// Undefined marks the server render and hydration, before browser storage is read.
function getServerSnapshot(): undefined {
  return undefined;
}

function toCatalogue(raw: string | null | undefined): Catalogue {
  if (raw === undefined) {
    return { status: "loading", products: [], errorMessage: "" };
  }
  try {
    return {
      status: "ready",
      products: parseStoredProducts(raw),
      errorMessage: "",
    };
  } catch (error) {
    console.error("Failed to read saved products", error);
    return {
      status: "error",
      products: [],
      errorMessage: LOAD_FAILURE_MESSAGE,
    };
  }
}

function commit(nextProducts: Product[]): MutationResult {
  try {
    window.localStorage.setItem(
      PRODUCTS_STORAGE_KEY,
      serializeProducts(nextProducts),
    );
  } catch (error) {
    console.error("Failed to save products", error);
    return { ok: false, message: SAVE_FAILURE_MESSAGE };
  }
  notifyListeners();
  return { ok: true };
}

export function useProducts() {
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { status, products, errorMessage } = useMemo(
    () => toCatalogue(raw),
    [raw],
  );

  function addProduct(input: ProductInput): MutationResult {
    return commit([...products, { id: crypto.randomUUID(), ...input }]);
  }

  function updateProduct(id: string, input: ProductInput): MutationResult {
    if (!products.some((product) => product.id === id)) {
      return { ok: false, message: MISSING_PRODUCT_MESSAGE };
    }
    return commit(
      products.map((product) => (product.id === id ? { ...input, id } : product)),
    );
  }

  function deleteProduct(id: string): MutationResult {
    if (!products.some((product) => product.id === id)) {
      return { ok: false, message: MISSING_PRODUCT_MESSAGE };
    }
    return commit(products.filter((product) => product.id !== id));
  }

  return {
    products,
    status,
    errorMessage,
    reload: () => window.location.reload(),
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
