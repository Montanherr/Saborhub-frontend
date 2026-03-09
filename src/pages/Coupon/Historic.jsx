import { useEffect,useState } from "react";
import couponService from "../../services/couponService";

export default function CouponHistory({companyId}){

  const [history,setHistory] = useState([]);

  useEffect(()=>{
    load();
  },[])

  async function load(){

    const data = await couponService.getCompanyCouponUsages(companyId);

    setHistory(data || []);

  }

  return(

    <div className="coupon-table-wrapper">

      <table className="coupon-table">

        <thead>
          <tr>
            <th>Cupom</th>
            <th>Pedido</th>
            <th>Telefone</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>

          {history.map(h=>(
            <tr key={h.id}>

              <td>{h.coupon?.code}</td>
              <td>{h.orderId}</td>
              <td>{h.phone}</td>
              <td>
                {new Date(h.createdAt).toLocaleString()}
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  );
}