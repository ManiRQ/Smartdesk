import type { ReactNode } from "react";
import { IconPencil, IconTrash } from "@/components/action-icons";
import type { Product } from "@/lib/products/model";
import { formatCurrency } from "@/lib/products/format";
import { GHOST_BUTTON } from "@/lib/styles";

type ProductTableProps = {
  products: readonly Product[];
  emptyState: ReactNode;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductTable({
  products,
  emptyState,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <caption className="sr-only">Products</caption>
        <thead className="border-b border-border bg-muted/50 text-muted-foreground">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">
              Product Name
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              SKU
            </th>
            <th scope="col" className="px-5 py-3 font-medium">
              Category
            </th>
            <th scope="col" className="px-5 py-3 text-right font-medium">
              Cost Price
            </th>
            <th scope="col" className="px-5 py-3 text-right font-medium">
              Selling Price
            </th>
            <th scope="col" className="px-5 py-3 text-right font-medium">
              Reorder Level
            </th>
            <th scope="col" className="px-5 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => (
            <tr
              key={product.id}
              className="transition-colors duration-150 hover:bg-muted/50"
            >
              <th scope="row" className="px-5 py-3 text-left font-medium text-foreground">
                {product.name}
              </th>
              <td className="px-5 py-3 text-muted-foreground">{product.sku}</td>
              <td className="px-5 py-3 text-muted-foreground">
                {product.category}
              </td>
              <td className="px-5 py-3 text-right tabular-nums">
                {formatCurrency(product.costPrice)}
              </td>
              <td className="px-5 py-3 text-right tabular-nums">
                {formatCurrency(product.sellingPrice)}
              </td>
              <td className="px-5 py-3 text-right tabular-nums">
                {product.reorderLevel}
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    aria-label={`Edit ${product.name}`}
                    className={`${GHOST_BUTTON} text-primary`}
                  >
                    <IconPencil className="size-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete ${product.name}`}
                    className={`${GHOST_BUTTON} text-destructive`}
                  >
                    <IconTrash className="size-4" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
