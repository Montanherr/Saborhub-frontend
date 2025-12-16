import { useEffect, useState } from "react";
import reportsService from "../../services/reportsService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip as ChartTooltip, Legend } from "chart.js";
import "./Reports.css";

// Registrar todos os componentes necessários do Chart.js
Chart.register(BarController, BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

export default function DashboardReports() {
  const companyId = Number(localStorage.getItem("companyId"));

  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // 🔹 Carregar relatórios da API
  const loadReports = async () => {
    try {
      const summaryRes = await reportsService.getSummary(companyId, startDate, endDate);
      const categoryRes = await reportsService.getByCategory(companyId, startDate, endDate);

      setSummary(summaryRes.data);

      setCategoryData(
        categoryRes.data.map((item) => ({
          name: item.category,
          pedidos: Number(item.totalItems),
        }))
      );
    } catch (err) {
      console.error("Erro ao carregar relatórios", err);
    }
  };

  useEffect(() => {
    loadReports();
  }, [companyId, startDate, endDate]);

  // 🔹 Export PDF avançado
  const exportPDF = async () => {
    const doc = new jsPDF({ unit: "px", format: "a4" });

    // ===== KPIs =====
    const startX = 20;
    let y = 30;
    const cardWidth = 150;
    const cardHeight = 50;
    const gap = 20;

    const kpis = [
      { title: "Total Pedidos", value: summary?.totalOrders ?? "--" },
      { title: "Faturamento", value: `R$ ${summary?.totalRevenue?.toFixed(2) ?? "--"}` },
      { title: "Ticket Médio", value: `R$ ${summary?.averageTicket?.toFixed(2) ?? "--"}` },
    ];

    kpis.forEach((kpi, index) => {
      const x = startX + index * (cardWidth + gap);
      doc.setFillColor(255, 106, 0);
      doc.roundedRect(x, y, cardWidth, cardHeight, 8, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(kpi.title, x + 10, y + 18);
      doc.setFontSize(16);
      doc.text(String(kpi.value), x + 10, y + 38);
    });

    y += cardHeight + 40;

    // ===== Gráfico de Pedidos por Categoria =====
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: categoryData.map((c) => c.name),
        datasets: [
          {
            label: "Pedidos",
            data: categoryData.map((c) => c.pedidos),
            backgroundColor: "#ff6a00",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true },
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", 20, y, 400, 200);

    doc.save("relatorio.pdf");
  };

  // 🔹 Export Excel
  const exportExcel = () => {
    const wsData = [
      ["Categoria", "Pedidos"],
      ...categoryData.map((item) => [item.name, item.pedidos]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "relatorio.xlsx");
  };

  return (
    <div className="dashboard-container">
      <h1>📊 Relatórios</h1>

      {/* Filtro de datas */}
      <div className="date-filter">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={loadReports}>Filtrar</button>
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button onClick={exportPDF}>Exportar PDF</button>
        <button onClick={exportExcel}>Exportar Excel</button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Pedidos</span>
          <strong>{summary?.totalOrders ?? "--"}</strong>
        </div>

        <div className="kpi-card">
          <span>Faturamento</span>
          <strong>R$ {Number(summary?.totalRevenue || 0).toFixed(2)}</strong>
        </div>

        <div className="kpi-card">
          <span>Ticket Médio</span>
          <strong>R$ {Number(summary?.averageTicket || 0).toFixed(2)}</strong>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Pedidos por Categoria</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
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
