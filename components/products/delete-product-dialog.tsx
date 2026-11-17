"use client";

import { useEffect, useRef, useState } from "react";
import type { MutationResult } from "@/hooks/use-products";
import type { Product } from "@/lib/products/model";
import { DANGER_BUTTON, DIALOG_CLASS, SECONDARY_BUTTON } from "@/lib/styles";

type DeleteProductDialogProps = {
  product: Product;
  onConfirm: () => Promise<MutationResult>;
  onClose: () => void;
};

export function DeleteProductDialog({
  product,
  onConfirm,
  onClose,
}: DeleteProductDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function handleConfirm() {
    setIsDeleting(true);
    const result = await onConfirm();
    if (result.ok) {
      dialogRef.current?.close();
      return;
    }
    setIsDeleting(false);
    setErrorMessage(result.message);
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="delete-product-title"
      aria-describedby="delete-product-description"
      className={DIALOG_CLASS}
    >
      <div className="p-6">
        <h2 id="delete-product-title" className="text-lg font-semibold">
          Delete product?
        </h2>
        <p
          id="delete-product-description"
          className="mt-2 text-sm text-muted-foreground"
        >
          {product.name} ({product.sku}) will be removed from your product list.
          This cannot be undone.
        </p>
        {errorMessage && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {errorMessage}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={SECONDARY_BUTTON}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className={DANGER_BUTTON}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
