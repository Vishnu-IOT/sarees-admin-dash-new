import client from "./client";

// GET /products/get-products?page=&limit=
export const getProducts = (page = 1, limit = 10) =>
  client
    .get(`/products/get-products?page=${page}&limit=${limit}`)
    .then((res) => res.data);

// GET /products/get-sarees?page=&limit=
export const getSarees = (page = 1, limit = 10) =>
  client
    .get(`/products/get-sarees?page=${page}&limit=${limit}`)
    .then((res) => res.data);

// GET /products/get-jewels?page=&limit=
export const getJewels = (page = 1, limit = 10) =>
  client
    .get(`/products/get-jewels?page=${page}&limit=${limit}`)
    .then((res) => res.data);

// Single helper to switch between All Products / Sarees / Jewels
export const getProductsByCollection = (collection, page = 1, limit = 10) => {
  if (collection === "SAREE") return getSarees(page, limit);
  if (collection === "JEWEL") return getJewels(page, limit);
  return getProducts(page, limit);
};

// GET /products/get-looms
export const getLoomProducts = () =>
  client
    .get("/products/get-looms")
    .then((res) => res.data.products || res.data || []);

// GET single product by ID
export const getProductById = (id) =>
  client.get(`/products/get-product/${id}`).then(
    (res) => res.data || [],
    // const products = res.data.products || [];
    // return products.find((p) => String(p.id) === String(id)) || null;
  );

// POST /products/create-product (multipart/form-data)
export const createProduct = (formData) =>
  client
    .post("/products/create-product", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);

// POST /products/update-product/:id
export const updateProduct = (id, payload) => {
  const config =
    payload instanceof FormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
  return client
    .post(`/products/update-product/${id}`, payload, config)
    .then((res) => res.data);
};

// POST /products/delete-product/:id
export const deleteProduct = (id) =>
  client.post(`/products/delete-product/${id}`).then((res) => res.data);

// POST /products/add-to-loom/:productId
export const addToLoom = (productId) =>
  client.post(`/products/add-to-loom/${productId}`).then((res) => res.data);

// POST /products/remove-from-loom/:productId
export const removeFromLoom = (productId) =>
  client
    .post(`/products/remove-from-loom/${productId}`)
    .then((res) => res.data);

// GET /products/product-status-update?id=:id&status=:status
export const updateProductStatus = (id, status) =>
  client
    .get(`/products/product-status-update?id=${id}&status=${status}`)
    .then((res) => res.data);

// Legacy API exports for backward compatibility
export const productsApi = {
  list: (params = {}) => getProducts(params.page || 1, params.limit || 10),
  get: getProductById,
  create: createProduct,
  update: updateProduct,
  remove: deleteProduct,
};
