import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "./Reports.css";

export default function DashboardReports() {
  // 🔹 MOCK DE DADOS (até backend ficar pronto)
  const accessData = [
    { day: "Seg", acessos: 120 },
    { day: "Ter", acessos: 210 },
    { day: "Qua", acessos: 180 },
    { day: "Qui", acessos: 260 },
    { day: "Sex", acessos: 320 },
    { day: "Sab", acessos: 400 },
    { day: "Dom", acessos: 290 },
  ];

  const orderData = [
    { name: "Hambúrguer", pedidos: 45 },
    { name: "Pizza", pedidos: 78 },
    { name: "Sushi", pedidos: 22 },
    { name: "Bebidas", pedidos: 96 },
  ];

  return (
    <div className="dashboard-container">
      <h1>📊 Relatórios</h1>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Acessos Hoje</span>
          <strong>328</strong>
        </div>
        <div className="kpi-card">
          <span>Pedidos</span>
          <strong>96</strong>
        </div>
        <div className="kpi-card">
          <span>Ticket Médio</span>
          <strong>R$ 42,90</strong>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="charts-grid">
        {/* Acessos */}
        <div className="chart-card">
          <h3>Acessos no Cardápio</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={accessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="acessos"
                stroke="#ff6a00"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pedidos */}
        <div className="chart-card">
          <h3>Pedidos por Produto</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pedidos" fill="#ff6a00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
