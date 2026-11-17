export class DuplicateSkuError extends Error {
  constructor() {
    super("A product with this SKU already exists.");
    this.name = "DuplicateSkuError";
  }
}
