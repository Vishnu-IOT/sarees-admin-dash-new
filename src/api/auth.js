import client from './client';

// POST /new/admin-login  { email, password }
export const login = (email, password) =>
  client.post('/new/admin-login', { email, password }).then((res) => res.data);

export default {
  login,
};
