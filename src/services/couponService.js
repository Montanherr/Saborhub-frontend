import api from "./api";

const couponService = {

  // listar cupons da empresa
  getCoupons: async (companyId) => {
    const response = await api.get(`/coupons/${companyId}/coupons`);
    return response.data;
  },

  // criar cupom
  createCoupon: async (companyId, data) => {
    const response = await api.post(`/coupons/${companyId}/coupons`, data);
    return response.data;
  },

  // atualizar cupom
  updateCoupon: async (id, data) => {
    const response = await api.put(`/coupons/${id}`, data);
    return response.data;
  },

  // deletar cupom
  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  // ativar / desativar cupom
  toggleCoupon: async (id) => {
    const response = await api.patch(`/coupons/${id}/toggle`);
    return response.data;
  },

  // aplicar cupom
  applyCoupon: async (data) => {
    const response = await api.post(`/coupons/apply`, data);
    return response.data;
  },

  // histórico de uso
  getCouponUsages: async (id) => {
    const response = await api.get(`/coupons/${id}/usages`);
    return response.data;
  },
  
getCompanyCouponUsages: async (companyId) => {
  const response = await api.get(`/coupons/company/${companyId}/usages`);
  return response.data;
}

};

export default couponService;