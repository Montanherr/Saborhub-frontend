import api from "./api";

const companyUserService = {
  create: async (data) => {
    // data = FormData
    const response = await api.post("/company-user", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default companyUserService;
