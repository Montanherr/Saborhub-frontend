import api from "./api"; // axios já configurado

const reportsService = {
  // 📊 KPIs principais
  getSummary(companyId, startDate, endDate) {
    return api.get(`/reports/summary/${companyId}`, {
      params: { startDate, endDate },
    });
  },

  // 📦 Relatório por categoria
  getByCategory(companyId, startDate, endDate) {
    return api.get(`/reports/by-category/${companyId}`, {
      params: { startDate, endDate },
    });
  },
};

export default reportsService;
