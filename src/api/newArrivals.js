import client from "./client";

// New Arrival Products
// GET /products/get-new-arrivals
export const getNewArrivals = () =>
  client
    .get("/products/get-new-arrivals")
    .then((res) => res.data.products || res.data || []);

// GET single new arrival by ID
export const getNewArrivalById = (id) =>
  client.get("/products/get-new-arrivals").then((res) => {
    const products = res.data.products || [];

    return products.find((p) => String(p.id) === String(id)) || null;
  });

// POST /products/add-to-new-arrival/:productId
export const addToNewArrival = (productId) =>
  client
    .post(`/products/add-to-new-arrival/${productId}`)
    .then((res) => res.data);

// POST /products/remove-from-new-arrival/:productId
export const removeFromNewArrival = (productId) =>
  client
    .post(`/products/remove-from-new-arrival/${productId}`)
    .then((res) => res.data);

// Optional grouped API
export const newArrivalsApi = {
  list: getNewArrivals,
  getById: getNewArrivalById,
  add: addToNewArrival,
  remove: removeFromNewArrival,
};
