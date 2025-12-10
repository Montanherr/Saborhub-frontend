import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import companyService from "../../services/companyService";
import "./Companies.css";

export default function Companies() {
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    companyService.getAll()
      .then(setRestaurants)
      .catch((err) => console.error("Erro ao carregar restaurantes:", err));
  }, []);

  const totalPages = Math.ceil(restaurants.length / itemsPerPage);
  const currentItems = restaurants.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleViewMenu = (companyId) => {
    navigate(`/companies/${companyId}/categories`);
  };

  return (
    <div className="companies-container">
      <h2 className="companies-title">Restaurantes</h2>

      <div className="restaurant-grid">
        {currentItems.length === 0 ? (
          <p>Carregando restaurantes...</p>
        ) : (
          currentItems.map((r) => (
            <div key={r.id} className="restaurant-card">
              <img
                src="/assets/zeroumadega.png"
                alt={r.fantasyName}
                className="restaurant-image"
              />

              <div className="restaurant-info">
                <h3>{r.fantasyName}</h3>
                <p>{r.description}</p>
                <button
                  className="see-more"
                  onClick={() => handleViewMenu(r.id)}
                >
                  Ver Cardápio
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            ◀
          </button>

          <span>{page} / {totalPages}</span>

          <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
