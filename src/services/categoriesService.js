import api from "./api";

const categoryService = {
  // 🔥 cria categoria DENTRO da empresa
  createCategory: async (companyId, data) => {
    const response = await api.post(
      `/companies/${companyId}/categories`,
      data
    );
    return response.data;
  },

  // 🔥 lista categorias de uma empresa
  getCategories: async (companyId) => {
    const response = await api.get(
      `/categories?companyId=${companyId}`
    );
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;
