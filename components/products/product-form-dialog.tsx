"use client";

import { useEffect, useRef } from "react";
import { ProductFormFields } from "@/components/products/product-form-fields";
import type { MutationResult } from "@/hooks/use-products";
import { useProductForm } from "@/hooks/use-product-form";
import type { Product, ProductInput } from "@/lib/products/model";
import { DIALOG_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/lib/styles";

type ProductFormDialogProps = {
  product: Product | null;
  products: readonly Product[];
  onSave: (input: ProductInput) => Promise<MutationResult>;
  onClose: () => void;
};

export function ProductFormDialog({
  product,
  products,
  onSave,
  onClose,
}: ProductFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isEditing = product !== null;
  const { values, errors, saveError, isSaving, updateField, handleSubmit } =
    useProductForm({
      product,
      products,
      onSave,
      onSaved: () => dialogRef.current?.close(),
    });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

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
          <button
            type="submit"
            disabled={isSaving}
            className={PRIMARY_BUTTON}
          >
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Add product"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
