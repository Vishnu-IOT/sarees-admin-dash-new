import client from './client';

// GET /orders/get-orders?page=&limit=&status=&search=&sort=
export const getOrders = (params = {}) =>
  client
    .get('/orders/get-orders', { params })
    .then((res) => res.data);

// GET /orders/get-order/:orderId
export const getOrderById = (orderId) =>
  client.get(`/orders/get-order/${orderId}`).then((res) => res.data);

// GET /orders/get-user-order/:userId
export const getOrderByUserId = (userId) =>
  client.get(`/orders/get-user-order/${userId}`).then((res) => res.data);

// POST /orders/create-order
export const createOrder = (payload) =>
  client.post('/orders/create-order', payload).then((res) => res.data);

// POST /orders/update-order-status/:id
export const updateOrderStatus = (id, status) =>
  client.post(`/orders/update-order-status/${id}`, status).then((res) => res.data);

// Legacy API exports for backward compatibility
export const ordersApi = {
  list: (params = {}) => getOrders(params),
  get: getOrderById,
  getuser: getOrderByUserId,
  create: createOrder,
  updateStatus: updateOrderStatus,
  remove: (id) => client.delete(`/orders/${id}`).then((r) => r.data)
};
