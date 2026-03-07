import { useEffect } from "react"; // 1. Importe o useEffect
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import AppRoutes from "./routes/routes";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import { socket } from "../src/socket/socket"; // 2. Importe sua instância do socket
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { initMercadoPago } from "@mercadopago/sdk-react";

function App() {
  // 3. Gerenciamento da conexão única do Socket
  initMercadoPago(process.env.REACT_APP_MP_PUBLIC_KEY);
  useEffect(() => {
    // Conecta ao servidor se ainda não estiver conectado
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("🟢 Conectado ao servidor Socket.io:", socket.id);
    });

    // Cleanup: Desconectar ao desmontar o App (evita o erro H27 de reconexões loucas)
    return () => {
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <ToastContainer />

      <Router>
        <AuthProvider>
          <div className="app-container">
            <div className="content-area">
              <Header />
              <main className="main-content full">
                <AppRoutes />
              </main>
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
