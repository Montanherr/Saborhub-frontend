import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import companyService from "../../services/companyService";
import { getRestaurantLogo } from "../../utils/restaurantLogos";
import "./Companies.css";

export default function Companies() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    companyService
      .getAll()
      .then((data) => {
        const filtered = data.filter(
          (company) =>
            company.plan !== "suspended" && !company.isBlocked
        );

        setRestaurants(filtered);
      })
      .catch((err) =>
        console.error("Erro ao carregar restaurantes:", err)
      )
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(
    restaurants.length / itemsPerPage
  );

  const currentItems = restaurants.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleViewMenu = (companyId) => {
    navigate(`/companies/${companyId}/categories`);
  };

  /* ======================
     SKELETON CARD
  ====================== */
  const SkeletonCard = () => (
    <div className="restaurant-card skeleton">
      <div className="image-wrapper skeleton-box" />
      <div className="restaurant-info">
        <div className="skeleton-line title" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );

  return (
    <div className="companies-container">
      <h2 className="companies-title">Restaurantes</h2>

      <div className="restaurant-grid">
        {loading ? (
          Array.from({ length: itemsPerPage }).map(
            (_, index) => <SkeletonCard key={index} />
          )
        ) : currentItems.length === 0 ? (
          <p className="loading">
            Nenhum restaurante encontrado
          </p>
        ) : (
          currentItems.map((r) => {
            const imageSrc =
              r.image || getRestaurantLogo(r.fantasyName);

            return (
              <div
                key={r.id}
                className="restaurant-card"
                onClick={() => handleViewMenu(r.id)}
              >
                <div className="image-wrapper">
                  <img
                    src={imageSrc}
                    alt={r.fantasyName}
                    className="restaurant-image"
                    onError={(e) => {
                      e.target.src =
                        "/images/restaurant-placeholder.png";
                    }}
                  />
                </div>

                <div className="restaurant-info">
                  <h3>{r.fantasyName}</h3>
                  <p>
                    {r.description ||
                      "Confira nosso cardápio"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            ◀
          </button>

          <span>
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
