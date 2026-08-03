import client from './client';

const API_BASE = '/service-request';

// GET all service requests
// GET /service-request/get-request?page=&limit=&status=&search=
export const getServiceRequests = (params = {}) =>
  client
    .get(`${API_BASE}/get-request`, { params })
    .then((res) => res.data);

// GET service request by ID
// GET /service-request/admin-reqeust-by-id/:id
export const getServiceRequestById = (id) =>
  client
    .get(`${API_BASE}/admin-reqeust-by-id/${id}`)
    .then((res) => res.data || []);

// GET requests for a specific order
// GET /service-request/orders-request/:orderId?page=&limit=
export const getRequestsByOrderId = (orderId, params = {}) =>
  client
    .get(`${API_BASE}/orders-request/${orderId}`, { params })
    .then((res) => res.data);

// POST create service request
// POST /service-request/create-request
export const createServiceRequest = (payload) =>
  client
    .post(`${API_BASE}/create-request`, payload)
    .then((res) => res.data);

// POST update service request status
// POST /service-request/update-request/:id
export const updateServiceRequestStatus = (id, payload) =>
  client
    .post(`${API_BASE}/update-request/${id}`, payload)
    .then((res) => res.data);

// POST update service request
// POST /service-request/update-request/:id
export const updateServiceRequest = (id, payload) =>
  client
    .post(`${API_BASE}/update-request/${id}`, payload)
    .then((res) => res.data);

// DELETE service request
// DELETE /service-request/delete-request/:id
export const deleteServiceRequest = (id) =>
  client
    .get(`${API_BASE}/delete-request/${id}`)
    .then((res) => res.data);
