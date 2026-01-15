import api from "./api";

const userService = {

  // Registrar (endpoint: /users/register)
  register: async (data) => {
    const response = await api.post("/users/register", data);
    return response.data;
  },

login: async ({ email, password }) => {
  const response = await api.post("/users/login", { email, password });
  return response.data;
},

  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getAdminUsers: async () => {
  const response = await api.get("/users/admin");
  return response.data;
},

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;
