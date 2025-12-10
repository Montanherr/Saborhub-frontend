

import "./Home.css";
import RestaurantList from "../../components/Companies/Companies";
import About from "../../components/About/About"

export default function Home() {
  return (
    <>
    <About />
    <div className="home-container">

      {/* Lista puxando da API */}
      <RestaurantList />
    </div>
    </>
  );
}
