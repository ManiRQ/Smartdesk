import { FormField, getFieldProps } from "@/components/products/form-field";
import type {
  ProductFieldErrors,
  ProductFormValues,
} from "@/lib/products/validation";
import { INPUT_CLASS } from "@/lib/styles";

type ProductPricingFieldsProps = {
  values: ProductFormValues;
  errors: ProductFieldErrors;
  onChange: (field: keyof ProductFormValues, value: string) => void;
};

export function ProductPricingFields({
  values,
  errors,
  onChange,
}: ProductPricingFieldsProps) {
  return (
    <>
      <FormField
        id="product-cost-price"
        label="Cost price (USD)"
        error={errors.costPrice}
      >
        <input
          {...getFieldProps("product-cost-price", errors.costPrice)}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={values.costPrice}
          onChange={(event) => onChange("costPrice", event.target.value)}
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField
        id="product-selling-price"
        label="Selling price (USD)"
        error={errors.sellingPrice}
      >
        <input
          {...getFieldProps("product-selling-price", errors.sellingPrice)}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={values.sellingPrice}
          onChange={(event) => onChange("sellingPrice", event.target.value)}
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField
        id="product-reorder-level"
        label="Reorder level"
        error={errors.reorderLevel}
      >
        <input
          {...getFieldProps("product-reorder-level", errors.reorderLevel)}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={values.reorderLevel}
          onChange={(event) => onChange("reorderLevel", event.target.value)}
          className={INPUT_CLASS}
        />
      </FormField>
    </>
  );
}
