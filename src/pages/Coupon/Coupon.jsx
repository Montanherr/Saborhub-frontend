import React, { useEffect, useState, useCallback } from "react";
import couponService from "../../services/couponService";
import "./Coupon.css";
import { toast } from "react-toastify";

export default function CouponsPage({ companyId }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ useCallback evita recriação da função a cada render
  const loadCoupons = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await couponService.getCoupons(companyId);
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar cupons");
    } finally {
      setLoading(false);
    }
  }, [companyId]); // depende apenas de companyId

  // ✅ useEffect agora depende de loadCoupons
  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // Deletar cupom
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir este cupom?")) return;

    try {
      await couponService.deleteCoupon(id);
      toast.success("Cupom excluído");
      loadCoupons(); // recarrega a lista
    } catch {
      toast.error("Erro ao excluir cupom");
    }
  };

  // Alternar status do cupom (ativo/inativo)
  const handleToggle = async (id) => {
    try {
      await couponService.toggleCoupon(id);
      toast.success("Status atualizado");
      loadCoupons();
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  // Editar cupom
  const handleEdit = (id) => {
    window.location.href = `/coupons/edit/${id}`;
  };

  return (
    <div className="coupon-container">
      {/* HEADER */}
      <div className="coupon-header">
        <h1>Cupons</h1>
      </div>

      {loading ? (
        <div className="coupon-loading">Carregando cupons...</div>
      ) : (
        <div className="coupon-table-wrapper">
          <table className="coupon-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Pedido mínimo</th>
                <th>Usos</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="coupon-code">{coupon.code}</td>
                    <td>
                      {coupon.discount_type === "percent"
                        ? "Porcentagem"
                        : "Valor"}
                    </td>
                    <td>
                      {coupon.discount_type === "percent"
                        ? `${coupon.discount_value}%`
                        : `R$ ${coupon.discount_value}`}
                    </td>
                    <td>R$ {coupon.min_order_value}</td>
                    <td>{coupon.usage_count}</td>
                    <td>
                      {coupon.active ? (
                        <span className="status active">Ativo</span>
                      ) : (
                        <span className="status inactive">Inativo</span>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn edit"
                          onClick={() => handleEdit(coupon.id)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn toggle"
                          onClick={() => handleToggle(coupon.id)}
                        >
                          Status
                        </button>
                        <button
                          className="btn delete"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="coupon-empty">
                    Nenhum cupom cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}