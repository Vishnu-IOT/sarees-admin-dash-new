import client from './client';

// GET /users
export const getUsers = () =>
  client.get('/users').then((res) => res.data || []);

// GET /users/:id
export const getUserById = (id) =>
  client.get(`/users/${id}`).then((res) => res.data);

// POST /users
export const createUser = (payload) =>
  client.post('/users', payload).then((res) => res.data);

// PUT /users/:id
export const updateUser = (id, payload) =>
  client.put(`/users/${id}`, payload).then((res) => res.data);

// DELETE /users/:id
export const deleteUser = (id) =>
  client.delete(`/users/${id}`).then((res) => res.data);

// Legacy API exports for backward compatibility
export const usersApi = {
  list: getUsers,
  get: getUserById,
  create: createUser,
  update: updateUser,
  remove: deleteUser
};
