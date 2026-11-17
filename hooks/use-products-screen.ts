"use client";

import { useCallback, useState } from "react";
import { type MutationResult, useProducts } from "@/hooks/use-products";
import { filterProducts } from "@/lib/products/filter";
import type {
  Product,
  ProductCategory,
  ProductInput,
} from "@/lib/products/model";

type FormState = { product: Product | null };

export function useProductsScreen() {
  const catalogue = useProducts();
  const { products, addProduct, updateProduct, deleteProduct } = catalogue;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [formState, setFormState] = useState<FormState | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const dismissNotice = useCallback(() => setNotice(null), []);
  const visibleProducts = filterProducts(products, query, category);

  function openCreateForm() {
    setFormState({ product: null });
  }

  function openEditForm(product: Product) {
    setFormState({ product });
  }

  function closeForm() {
    setFormState(null);
  }

  function requestDelete(product: Product) {
    setProductToDelete(product);
  }

  function closeDelete() {
    setProductToDelete(null);
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
  }

  function handleSave(input: ProductInput): MutationResult {
    const editingProduct = formState?.product ?? null;
    const result = editingProduct
      ? updateProduct(editingProduct.id, input)
      : addProduct(input);
    if (result.ok) {
      setNotice(editingProduct ? "Product updated." : "Product added.");
    }
    return result;
  }

  function handleDelete(product: Product): MutationResult {
    const result = deleteProduct(product.id);
    if (result.ok) {
      setNotice("Product deleted.");
    }
    return result;
  }

  return {
    ...catalogue,
    query,
    setQuery,
    category,
    setCategory,
    visibleProducts,
    formState,
    productToDelete,
    notice,
    dismissNotice,
    openCreateForm,
    openEditForm,
    closeForm,
    requestDelete,
    closeDelete,
    clearFilters,
    handleSave,
    handleDelete,
  };
}
