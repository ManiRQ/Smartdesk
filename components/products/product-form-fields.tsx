import { FormField, getFieldProps } from "@/components/products/form-field";
import { ProductPricingFields } from "@/components/products/product-pricing-fields";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/lib/products/model";
import type {
  ProductFieldErrors,
  ProductFormValues,
} from "@/lib/products/validation";
import { INPUT_CLASS } from "@/lib/styles";

type ProductFormFieldsProps = {
  values: ProductFormValues;
  errors: ProductFieldErrors;
  onChange: (field: keyof ProductFormValues, value: string) => void;
};

export function ProductFormFields({
  values,
  errors,
  onChange,
}: ProductFormFieldsProps) {
  return (
    <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
      <FormField
        id="product-name"
        label="Product name"
        error={errors.name}
        className="sm:col-span-2"
      >
        <input
          {...getFieldProps("product-name", errors.name)}
          type="text"
          autoComplete="off"
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField id="product-sku" label="SKU" error={errors.sku}>
        <input
          {...getFieldProps("product-sku", errors.sku)}
          type="text"
          autoComplete="off"
          value={values.sku}
          onChange={(event) => onChange("sku", event.target.value)}
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField id="product-category" label="Category" error={errors.category}>
        <select
          {...getFieldProps("product-category", errors.category)}
          value={values.category}
          onChange={(event) => onChange("category", event.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">Select a category</option>
          {PRODUCT_CATEGORIES.map((option: ProductCategory) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </FormField>

      <ProductPricingFields values={values} errors={errors} onChange={onChange} />
    </div>
  );
}
