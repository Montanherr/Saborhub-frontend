import "./OrderStepper.css";

export default function OrderStepper({ step }) {
  const steps = ["Pedido", "Dados", "Carrinho"];

  return (
    <div className="order-stepper">
      {steps.map((label, index) => (
        <div
          key={label}
          className={`step ${step === index ? "active" : ""} ${step > index ? "done" : ""}`}
        >
          <div className="circle">{index + 1}</div>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
