"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { ProductFormFields } from "@/components/products/product-form-fields";
import type { MutationResult } from "@/hooks/use-products";
import type { Product, ProductInput } from "@/lib/products/model";
import {
  EMPTY_PRODUCT_FORM,
  productToFormValues,
  type ProductFieldErrors,
  type ProductFormValues,
  validateProductForm,
} from "@/lib/products/validation";
import { DIALOG_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/lib/styles";

type ProductFormDialogProps = {
  product: Product | null;
  products: readonly Product[];
  onSave: (input: ProductInput) => MutationResult;
  onClose: () => void;
};

export function ProductFormDialog({
  product,
  products,
  onSave,
  onClose,
}: ProductFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<ProductFormValues>(() =>
    product ? productToFormValues(product) : EMPTY_PRODUCT_FORM,
  );
  const [errors, setErrors] = useState<ProductFieldErrors>({});
  const [saveError, setSaveError] = useState("");
  const isEditing = product !== null;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function updateField(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");
    const result = validateProductForm(values, products, product?.id ?? null);
    setErrors(result.errors);
    if (result.input === null) {
      return;
    }
    const saved = onSave(result.input);
    if (saved.ok) {
      dialogRef.current?.close();
      return;
    }
    setSaveError(saved.message);
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="product-form-title"
      className={DIALOG_CLASS}
    >
      <form noValidate onSubmit={handleSubmit}>
        <div className="border-b border-border px-6 py-4">
          <h2 id="product-form-title" className="text-lg font-semibold">
            {isEditing ? "Edit product" : "Add product"}
          </h2>
        </div>

        <ProductFormFields
          values={values}
          errors={errors}
          onChange={updateField}
        />

        {saveError && (
          <p role="alert" className="px-6 pb-2 text-sm text-destructive">
            {saveError}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={SECONDARY_BUTTON}
          >
            Cancel
          </button>
          <button type="submit" className={PRIMARY_BUTTON}>
            {isEditing ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
