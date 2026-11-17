"use client";

import { IconPlus } from "@/components/action-icons";
import { PageHeader } from "@/components/page-header";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ProductList } from "@/components/products/product-list";
import { ProductToolbar } from "@/components/products/product-toolbar";
import { StatusToast } from "@/components/status-toast";
import { useProductsScreen } from "@/hooks/use-products-screen";
import { PRIMARY_BUTTON } from "@/lib/styles";

export function ProductsView() {
  const {
    products,
    status,
    errorMessage,
    reload,
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
  } = useProductsScreen();
  const isReady = status === "ready";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Maintain your product catalogue: names, SKUs, categories, prices and reorder levels."
        action={
          <button
            type="button"
            onClick={openCreateForm}
            disabled={!isReady}
            className={PRIMARY_BUTTON}
          >
            <IconPlus className="size-4" />
            Add Product
          </button>
        }
      />

      <ProductToolbar
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
      />

      <ProductList
        status={status}
        errorMessage={errorMessage}
        onRetry={reload}
        totalCount={products.length}
        visibleProducts={visibleProducts}
        onAdd={openCreateForm}
        onClearFilters={clearFilters}
        onEdit={openEditForm}
        onDelete={requestDelete}
      />

      {formState && (
        <ProductFormDialog
          product={formState.product}
          products={products}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {productToDelete && (
        <DeleteProductDialog
          product={productToDelete}
          onConfirm={() => handleDelete(productToDelete)}
          onClose={closeDelete}
        />
      )}

      {notice && <StatusToast message={notice} onDismiss={dismissNotice} />}
    </div>
  );
}
