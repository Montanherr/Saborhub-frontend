// 📅 Dias de funcionamento (padrão iFood)
export function formatWorkingDays(days = []) {
  if (!Array.isArray(days) || days.length === 0) {
    return "Dias não informados";
  }

  const labels = {
    monday: "Seg",
    tuesday: "Ter",
    wednesday: "Qua",
    thursday: "Qui",
    friday: "Sex",
    saturday: "Sáb",
    sunday: "Dom",
  };

  const order = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // filtra apenas dias válidos e ordena
  const sorted = order.filter(
    (d) => days.includes(d) && labels[d]
  );

  if (!sorted.length) {
    return "Dias não informados";
  }

  // todos os dias
  if (sorted.length === 7) {
    return "Todos os dias";
  }

  const startIndex = order.indexOf(sorted[0]);
  const endIndex = order.indexOf(sorted[sorted.length - 1]);

  const isSequential =
    endIndex - startIndex + 1 === sorted.length;

  if (isSequential && sorted.length > 1) {
    return `${labels[sorted[0]]} a ${labels[sorted[sorted.length - 1]]}`;
  }

  return sorted.map(d => labels[d]).join(", ");
}
