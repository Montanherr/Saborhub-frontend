import { useState } from "react";
import couponService from "../../services/couponService";
import { toast } from "react-toastify";

export default function CouponCreate({companyId}){

  const [form,setForm] = useState({
    code:"",
    discount_type:"percent",
    discount_value:"",
    min_order_value:"",
    usage_limit:""
  });

  function handleChange(e){
    setForm({...form,[e.target.name]:e.target.value});
  }

  async function handleSubmit(e){
    e.preventDefault();

    try{

      await couponService.createCoupon(companyId,form);

      toast.success("Cupom criado!");

      setForm({
        code:"",
        discount_type:"percent",
        discount_value:"",
        min_order_value:"",
        usage_limit:""
      });

    }catch(err){
      toast.error("Erro ao criar cupom");
    }

  }

  return(

    <form className="coupon-form" onSubmit={handleSubmit}>

      <div className="form-group">
        <label>Código</label>
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Tipo desconto</label>
        <select
          name="discount_type"
          value={form.discount_type}
          onChange={handleChange}
        >
          <option value="percent">Porcentagem</option>
          <option value="fixed">Valor</option>
        </select>
      </div>

      <div className="form-group">
        <label>Valor desconto</label>
        <input
          name="discount_value"
          value={form.discount_value}
          onChange={handleChange}
          type="number"
          required
        />
      </div>

      <div className="form-group">
        <label>Pedido mínimo</label>
        <input
          name="min_order_value"
          value={form.min_order_value}
          onChange={handleChange}
          type="number"
        />
      </div>

      <div className="form-group">
        <label>Limite de uso</label>
        <input
          name="usage_limit"
          value={form.usage_limit}
          onChange={handleChange}
          type="number"
        />
      </div>

      <button className="btn-create">
        Criar Cupom
      </button>

    </form>

  );
}