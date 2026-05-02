import api from "./api"; // seu axios configurado

const additionalService = {
  // LISTAR
async getAll(companyId) {
  const response = await api.get(`/additional/${companyId}`);
  return response.data;
},

  // CRIAR
  async create(data) {
    const response = await api.post("/additional", data);
    return response.data;
  },

  // ATUALIZAR
  async update(id, data) {
    const response = await api.put(`/additional/${id}`, data);
    return response.data;
  },

  // DELETAR
  async remove(id) {
    const response = await api.delete(`/additional/${id}`);
    return response.data;
  },
};

export default additionalService;