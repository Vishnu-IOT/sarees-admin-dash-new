import client from './client';

// GET /users/get-customer?role=Customer&page=&limit=
// Backend already joins each customer with their Orders and returns `orderCount`.
export const getCustomers = (page = 1, limit = 10) =>
  client
    .get('/users/get-customer', { params: { role: 'Customer', page, limit } })
    .then((res) => res.data);

// GET /users/:id
export const getCustomerById = (id) =>
  client.get(`/users/get-customer-id/${id}`).then((res) => res.data);
