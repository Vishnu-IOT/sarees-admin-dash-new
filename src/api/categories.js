import client from "./client";

// GET /category/get-categories -> { success, data: [...] }
export const getCategories = () =>
  client.get("/category/get-categories").then((res) => res.data || []);

// GET /category/get-categories/:collection -> { success, data: [...] }
export const getCategoriesByCollection = (collection) =>
  client
    .get(`/category/get-categories/${collection}`)
    .then((res) => res.data || []);

// POST /category/create-category -> { name, collection }
export const createCategory = (payload) =>
  client.post("/category/create-category", payload).then((res) => res.data);

// POST /category/update-category/:id
export const updateCategory = (id, payload) =>
  client
    .post(`/category/update-category/${id}`, payload)
    .then((res) => res.data.data || res.data);

// DELETE /category/delete-category/:id
export const deleteCategory = (id) =>
  client.get(`/category/delete-category/${id}`).then((res) => res.data);

// GET /category/category-status-update?id=:id&status=:status
export const updateCategoryStatus = (id, status) =>
  client
    .get(`/category/category-status-update?id=${id}&status=${status}`)
    .then((res) => res.data);

// Legacy API exports for backward compatibility
export const categoriesApi = {
  list: getCategories,
  create: createCategory,
  update: updateCategory,
  remove: deleteCategory,
};
