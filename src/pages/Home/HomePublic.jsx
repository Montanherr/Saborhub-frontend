

import "./Home.css";
import RestaurantList from "../../components/Companies/Companies";

export default function Home() {
  return (
    <>
    <div className="home-container">

      {/* Lista puxando da API */}
      <RestaurantList />
    </div>
    </>
  );
}
