import { useState } from '#imports'
import type { CatalogItem } from '~/types/site'

export function useProductDetails() {
  const product = useState<CatalogItem | null>('site-product-details', () => null)

  function openProductDetails(next: CatalogItem) {
    product.value = next
  }

  function closeProductDetails() {
    product.value = null
  }

  return { product, openProductDetails, closeProductDetails }
}
