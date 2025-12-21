import { useState } from "react";
import CompanyPage from "./Company/CompanyPage";
import UserPage from "./User/UserPage";
import "./Index.css";

export default function Admin() {
  const [tab, setTab] = useState("company");

  return (
    <div className="admin-container">
      <div className="tabs">
        <button
          className={tab === "company" ? "active" : ""}
          onClick={() => setTab("company")}
        >
          Empresas
        </button>

        <button
          className={tab === "user" ? "active" : ""}
          onClick={() => setTab("user")}
        >
          Usuários
        </button>
      </div>

      <div className="tab-content">
        {tab === "company" && <CompanyPage />}
        {tab === "user" && <UserPage />}
      </div>
    </div>
  );
}
