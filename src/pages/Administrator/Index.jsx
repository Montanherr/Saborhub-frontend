import { useState } from "react";
import UserPage from "./User/UserPage";
import "./Index.css";

export default function Admin() {
  const [tab, setTab] = useState("user");

  return (
    <div className="admin-container">
      <div className="tabs">
     

        <button
          className={tab === "user" ? "active" : ""}
          onClick={() => setTab("user")}
        >
          Usuários
        </button>
      </div>

      <div className="tab-content">
        {tab === "user" && <UserPage />}
      </div>
    </div>
  );
}
