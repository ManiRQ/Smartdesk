import { IconSearch } from "@/components/action-icons";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { IconProducts } from "@/components/icons";
import { ProductTable } from "@/components/products/product-table";
import type { ProductsStatus } from "@/hooks/use-products";
import type { Product } from "@/lib/products/model";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/lib/styles";

type ProductListProps = {
  status: ProductsStatus;
  errorMessage: string;
  onRetry: () => void;
  totalCount: number;
  visibleProducts: Product[];
  onAdd: () => void;
  onClearFilters: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const SKELETON_ROW_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"];

export function ProductList({
  status,
  errorMessage,
  onRetry,
  totalCount,
  visibleProducts,
  onAdd,
  onClearFilters,
  onEdit,
  onDelete,
}: ProductListProps) {
  if (status === "loading") {
    return (
      <Card>
        <div role="status" aria-label="Loading products" className="divide-y divide-border">
          {SKELETON_ROW_IDS.map((rowId) => (
            <div key={rowId} className="flex animate-pulse items-center gap-4 px-5 py-4">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="ml-auto h-4 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-foreground">
          Products unavailable
        </h2>
        <p role="alert" className="mt-2 text-sm text-muted-foreground">
          {errorMessage}
        </p>
        <button type="button" onClick={onRetry} className={`${SECONDARY_BUTTON} mt-6`}>
          Try again
        </button>
      </Card>
    );
  }

  const noProductsState = (
    <EmptyState
      Icon={IconProducts}
      title="No products yet"
      description="Add your first product to start building your catalogue."
      action={
        <button type="button" onClick={onAdd} className={PRIMARY_BUTTON}>
          Add Product
        </button>
      }
    />
  );

  const noResultsState = (
    <EmptyState
      Icon={IconSearch}
      title="No products match your filters"
      description="Try a different search term or category."
      action={
        <button type="button" onClick={onClearFilters} className={SECONDARY_BUTTON}>
          Clear filters
        </button>
      }
    />
  );

  return (
    <Card className="overflow-hidden">
      <ProductTable
        products={visibleProducts}
        emptyState={totalCount === 0 ? noProductsState : noResultsState}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </Card>
  );
}
