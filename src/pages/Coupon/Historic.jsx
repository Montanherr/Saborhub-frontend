import { useEffect, useState, useCallback } from "react";
import couponService from "../../services/couponService";

export default function CouponHistory({ companyId }) {
  const [history, setHistory] = useState([]);

  // ✅ useCallback "trava" a função load para que não seja recriada a cada render
  const load = useCallback(async () => {
    if (!companyId) return; // evita chamadas desnecessárias

    try {
      const data = await couponService.getCompanyCouponUsages(companyId);
      setHistory(data || []);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
  }, [companyId]); // 🔹 depende apenas de companyId

  // ✅ useEffect depende de load
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="coupon-table-wrapper">
      <table className="coupon-table">
        <thead>
          <tr>
            <th>Cupom</th>
            <th>Pedido</th>
            <th>Telefone</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((h) => (
              <tr key={h.id}>
                <td>{h.coupon?.code}</td>
                <td>{h.orderId}</td>
                <td>{h.phone}</td>
                <td>{new Date(h.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Nenhum histórico encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}