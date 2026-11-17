import { type FormEvent, useState } from "react";
import type { MutationResult } from "@/hooks/use-products";
import type { Product, ProductInput } from "@/lib/products/model";
import {
  EMPTY_PRODUCT_FORM,
  issuesToFieldErrors,
  productToFormValues,
  type ProductFieldErrors,
  type ProductFormValues,
  validateProductForm,
} from "@/lib/products/validation";

type UseProductFormOptions = {
  product: Product | null;
  products: readonly Product[];
  onSave: (input: ProductInput) => Promise<MutationResult>;
  onSaved: () => void;
};

export function useProductForm({
  product,
  products,
  onSave,
  onSaved,
}: UseProductFormOptions) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    product ? productToFormValues(product) : EMPTY_PRODUCT_FORM,
  );
  const [errors, setErrors] = useState<ProductFieldErrors>({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");
    const result = validateProductForm(values, products, product?.id ?? null);
    setErrors(result.errors);
    if (result.input === null) {
      return;
    }
    setIsSaving(true);
    const saved = await onSave(result.input);
    if (saved.ok) {
      onSaved();
      return;
    }
    setIsSaving(false);
    setErrors(issuesToFieldErrors(saved.issues));
    setSaveError(saved.message);
  }

  return { values, errors, saveError, isSaving, updateField, handleSubmit };
}
