import client from './client';

// Loom Products (Direct-from-loom product listings)
// GET /products/get-looms
export const getLooms = () =>
  client.get('/products/get-looms').then((res) => res.data.products || res.data || []);

// GET single loom by ID
export const getLoomById = (id) =>
  client.get('/products/get-looms').then((res) => {
    const products = res.data.products || [];
    return products.find((p) => String(p.id) === String(id)) || null;
  });

// POST /products/add-to-loom/:productId
// Tag an existing product as a loom product.
// This calls the dedicated backend endpoint which only flips the `loom` flag
// and never touches price/variants/images.
export const addToLoom = (productId) =>
  client.post(`/products/add-to-loom/${productId}`).then((res) => res.data);

// POST /products/remove-from-loom/:productId
export const removeFromLoom = (productId) =>
  client.post(`/products/remove-from-loom/${productId}`).then((res) => res.data);
