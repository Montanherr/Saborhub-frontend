import zeroumadega from "../utils/assets/zeroumadega.png";
import marmitarialurdes from "../utils/assets/marmitarialurdes.png";
import placeholder from "../utils/assets/6605550.jpg";

const restaurantLogos = {
  "ZeroUm Adega": zeroumadega,
  "Marmitaria da Lurdes": marmitarialurdes
};

export function getRestaurantLogo(name) {
  return restaurantLogos[name] || placeholder;
}
