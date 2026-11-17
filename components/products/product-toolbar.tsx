import { IconSearch } from "@/components/action-icons";
import {
  isProductCategory,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/lib/products/model";
import { INPUT_CLASS } from "@/lib/styles";

type ProductToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  category: ProductCategory | "";
  onCategoryChange: (category: ProductCategory | "") => void;
};

export function ProductToolbar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
}: ProductToolbarProps) {
  function handleCategoryChange(rawValue: string) {
    onCategoryChange(isProductCategory(rawValue) ? rawValue : "");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Search by product name or SKU</span>
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by name or SKU"
          className={`${INPUT_CLASS} pl-9`}
        />
      </label>
      <label className="sm:w-56">
        <span className="sr-only">Filter by category</span>
        <select
          value={category}
          onChange={(event) => handleCategoryChange(event.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">All categories</option>
          {PRODUCT_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
