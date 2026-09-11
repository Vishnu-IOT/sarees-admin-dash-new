import client from "./client";

// GET /category/get-subcategories -> { success, data: [...] }
export const getSubCategories = () =>
  client.get("/category/get-subcategories").then((res) => res.data || []);

// GET /category/get-subcategories/:collection
export const getSubCategoriesByCollection = (collection) =>
  client
    .get(`/category/get-subcategories/${collection}`)
    .then((res) => res.data || []);

// GET /category/get-subcategories-by-category/:categoryId
export const getSubCategoriesByCategoryId = (categoryId) =>
  client
    .get(`/category/get-subcategories-by-category/${categoryId}`)
    .then((res) => res.data || []);

// POST /category/create-subcategory -> payload: { name, categoryId, image, status }
export const createSubCategory = (payload) =>
  client.post("/category/create-subcategory", payload).then((res) => res.data);

// POST /category/update-subcategory/:id
export const updateSubCategory = (id, payload) =>
  client
    .post(`/category/update-subcategory/${id}`, payload)
    .then((res) => res.data);

// DELETE /category/delete-subcategory/:id
export const deleteSubCategory = (id) =>
  client.get(`/category/delete-subcategory/${id}`).then((res) => res.data);

// GET /category/subcategory-status-update?id=:id&status=:status
export const updateSubCategoryStatus = (id, status) =>
  client
    .get(`/category/subcategory-status-update?id=${id}&status=${status}`)
    .then((res) => res.data);

// Legacy API exports for backward compatibility
export const subcategoriesApi = {
  list: getSubCategories,
  create: createSubCategory,
  update: updateSubCategory,
  remove: deleteSubCategory,
};
