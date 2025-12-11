import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import AppRoutes from "./routes/routes";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <>
      <ToastContainer />

      <Router>
        <AuthProvider>
          {" "}
          {/* ✔ Agora TUDO está dentro do AuthProvider */}
          <div className="app-container">
            <div className="content-area">
              <Header /> {/* ✔ Agora useAuth() funciona */}
              <main className="main-content">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </div>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
