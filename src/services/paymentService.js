import api from "./api";

const paymentService = {

  createPayment: async (orderId, paymentMethod, email, formData = null) => {

    const { data } = await api.post("/payments/create", {
      orderId,
      paymentMethod,
      email,
      formData
    });

    return data;

  },

  checkStatus: async (orderId) => {

    const { data } = await api.get(`/payments/status/${orderId}`);
    return data;

  }

};

export default paymentService;