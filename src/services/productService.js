import api from "./api";

const productService = {
  // 🔹 Criar produto (com companyId e categoryId no body)
  createProduct: async (data) => {
    const response = await api.post("/products", data);
    return response.data;
  },

  // 🔹 Buscar TODOS os produtos (admin)
  getProducts: async () => {
    const response = await api.get("/products");
    return response.data;
  },

  // 🔥 Buscar produtos POR EMPRESA (cardápio)
  getProductsByCompany: async (companyId) => {
    const response = await api.get(
      `/products?companyId=${companyId}`
    );
    return response.data;
  },

  // 🔹 Buscar produto por ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // 🔹 Atualizar produto
  updateProduct: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // 🔹 Excluir produto
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

export default productService;
