import { useState } from "react";
import CouponList from "./Coupon";
import CouponCreate from "./Register";
import CouponHistory from "./Historic";
import "./CouponPages.css";

export default function CouponsPage({ companyId }) {

  const [tab,setTab] = useState("list");

  return (

    <div className="coupon-container">

      <div className="coupon-header">
        <h1>Cupons</h1>
      </div>

      <div className="coupon-tabs">

        <button
          className={tab==="list" ? "tab active":"tab"}
          onClick={()=>setTab("list")}
        >
          Cupons
        </button>

        <button
          className={tab==="create" ? "tab active":"tab"}
          onClick={()=>setTab("create")}
        >
          Criar cupom
        </button>

        <button
          className={tab==="history" ? "tab active":"tab"}
          onClick={()=>setTab("history")}
        >
          Histórico
        </button>

      </div>

      {tab==="list" && <CouponList companyId={companyId}/>}
      {tab==="create" && <CouponCreate companyId={companyId}/>}
      {tab==="history" && <CouponHistory companyId={companyId}/>}

    </div>

  );
}