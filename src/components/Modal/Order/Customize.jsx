import { useEffect, useState } from "react";
import additionalService from "../../../services/additionalService";
import "./Customize.css";

export default function CustomizeModal({
  item,
  companyId,
  onSave,
  onClose,
}) {
  const [additionals, setAdditionals] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!companyId) return;

    async function loadAdditionals() {
      try {
        const data = await additionalService.getAll(companyId);
        setAdditionals(data);
      } catch (err) {
        console.error("Erro ao carregar adicionais", err);
      }
    }

    loadAdditionals();
  }, [companyId]);

  const handleIncrease = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleDecrease = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  const totalAdditionals = additionals.reduce((acc, add) => {
    return acc + (selected[add.id] || 0) * add.price;
  }, 0);

  const handleSave = () => {
    const selectedAdditionals = additionals
      .filter((add) => selected[add.id] > 0)
      .map((add) => ({
        id: add.id,
        name: add.name,
        price: add.price,
        quantity: selected[add.id],
      }));

    const updatedItem = {
      ...item,
      additionals: selectedAdditionals,
    };

    onSave(updatedItem); // 🔥 envia pro pai
  };

  useEffect(() => {
  if (!item?.uniqueId) return;

  const saved = localStorage.getItem(`customize_${item.uniqueId}`);

  if (saved) {
    try {
      setSelected(JSON.parse(saved));
    } catch {
      setSelected({});
    }
  } else if (item?.additionals) {
    // 👇 fallback caso venha do carrinho
    const initial = {};

    item.additionals.forEach((add) => {
      initial[add.id] = add.quantity;
    });

    setSelected(initial);
  }
}, [item]);

useEffect(() => {
  if (!item?.uniqueId) return;

  localStorage.setItem(
    `customize_${item.uniqueId}`,
    JSON.stringify(selected)
  );
}, [selected, item]);

  if (!item) return null;

  return (
    <div className="customize-modal-backdrop">
      <div className="customize-modal">

        {/* HEADER */}
        <div className="top-bar">
          <button className="back-btn" onClick={onClose}>
            ← Voltar
          </button>
        </div>

        <div className="customize-container">
          <div className="product-header">
            <div>
              <h2>{item.name}</h2>
              <p>Personalize seu pedido</p>
            </div>
            <span className="product-price">
              R$ {Number(item.price).toFixed(2)}
            </span>
          </div>

          {/* LISTA */}
          <div className="additional-list">
            {additionals.map((add) => (
              <div key={add.id} className="additional-card">
                <div className="additional-info">
                  <span className="name">{add.name}</span>
                  <span className="price">
                    + R$ {Number(add.price).toFixed(2)}
                  </span>
                </div>

                <div className="controls">
                  <button onClick={() => handleDecrease(add.id)}>-</button>
                  <span>{selected[add.id] || 0}</span>
                  <button onClick={() => handleIncrease(add.id)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="customize-footer">
          <div className="total">
            Total adicionais:{" "}
            <strong>R$ {totalAdditionals.toFixed(2)}</strong>
          </div>

          <button className="save-btn" onClick={handleSave}>
            Salvar Personalização
          </button>
        </div>
      </div>
    </div>
  );
}