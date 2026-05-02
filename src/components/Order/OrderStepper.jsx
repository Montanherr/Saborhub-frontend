import "./OrderStepper.css";

export default function OrderStepper({ step }) {
  const steps = ["Pedido", "Carrinho", "Enviar Pedido"];

  const progressMap = {
  0: "0%",
  1: "50%",
  2: "100%",
};

  return (
    <div className="order-stepper" style={{ "--progress": progressMap[step] }}>
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
