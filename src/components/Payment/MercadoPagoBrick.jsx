import { Payment } from "@mercadopago/sdk-react";
import paymentService from "../../services/paymentService";

export default function MercadoPagoBrick({ total, orderId, email }) {

  const initialization = {
    amount: Number(total)
  };

  const customization = {
    paymentMethods: {
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
      bankTransfer: "all",
    }
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }) => {

    try {

      await paymentService.createPayment(
        orderId,
        selectedPaymentMethod,
        email,
        formData
      );

    } catch (error) {

      console.error("Erro pagamento:", error);
      throw error;

    }

  };

  const onError = async (error) => {
    console.error("Erro Mercado Pago:", error);
  };

  const onReady = async () => {
    console.log("Brick carregado");
  };

  return (
    <Payment
      initialization={initialization}
      customization={customization}
      onSubmit={onSubmit}
      onReady={onReady}
      onError={onError}
    />
  );
}