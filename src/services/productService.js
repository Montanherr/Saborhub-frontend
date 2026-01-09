import api from "./api";

const productService = {
  createProduct: async (data) => {
    // Se data for FormData, não setar headers manualmente
    const response = await api.post("/products", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await api.put(`/products/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

getProductsByCompany: async (companyId) => {
  const response = await api.get(`/products/company/${companyId}`);
  return response.data;
},

  toggleProductAvailability(id) {
    return api.patch(`/products/${id}/availability`);
  },

getProductsByCompany: async (companyId) => {
  const response = await api.get(
    `/products/admin/company/${companyId}`
  );
  return response.data;
},

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
