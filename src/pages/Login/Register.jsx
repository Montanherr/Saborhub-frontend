import { useState } from "react";
import { useNavigate } from "react-router-dom";

import companyUserService from "../../services/companyUserService";
import { maskCPF, maskCNPJ } from "../../utils/masks";
import Toast from "../../components/Alerts/Toast";

import "./Register.css";

export default function RegisterCompany() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [errors, setErrors] = useState({});

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [company, setCompany] = useState({
    fantasyName: "",
    corporateName: "",
    document: "",
    email: "",
    phone: "",
  });

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    role: "manager",
  });

  /* ===============================
     MASK PHONE
  ================================ */
  function maskPhone(value) {
    value = value.replace(/\D/g, "");
    if (value.length <= 10)
      return value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");

    return value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }

  /* ===============================
     VALIDATION STEP 1 – COMPANY
  ================================ */
  function validateStep1() {
    const e = {};

    if (!company.fantasyName.trim())
      e.fantasyName = "Informe o nome fantasia";

    if (!company.corporateName.trim())
      e.corporateName = "Informe a razão social";

    if (company.document.replace(/\D/g, "").length !== 14)
      e.document = "CNPJ inválido";

    if (!company.email.includes("@"))
      e.email = "E-mail inválido";

    if (company.phone.replace(/\D/g, "").length < 10)
      e.phone = "Telefone inválido";

    if (image) {
      if (!image.type.startsWith("image/"))
        e.image = "O arquivo deve ser uma imagem";

      if (image.size > 2 * 1024 * 1024)
        e.image = "Imagem deve ter no máximo 2MB";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ===============================
     VALIDATION STEP 2 – USER
  ================================ */
  function validateStep2() {
    const e = {};

    if (!user.name.trim())
      e.name = "Informe o nome completo";

    if (!user.email.includes("@"))
      e.email = "E-mail inválido";

    if (user.password.length < 6)
      e.password = "A senha deve ter no mínimo 6 caracteres";

    if (user.cpf.replace(/\D/g, "").length !== 11)
      e.cpf = "CPF inválido";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ===============================
     IMAGE HANDLER
  ================================ */
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  /* ===============================
     SUBMIT
  ================================ */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateStep2()) return;

    try {
      const formData = new FormData();
      formData.append("company", JSON.stringify(company));
      formData.append("user", JSON.stringify(user));

      if (image) {
        formData.append("image", image);
      }

      await companyUserService.create(formData);

      // ✅ SUCESSO
      setToast({
        message: "Empresa criada com sucesso! Faça login para continuar.",
        type: "success",
      });

      // 🔁 REDIRECIONA PARA LOGIN
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      // ❌ ERROS VINDOS DO BACKEND
      const backendError = err.response?.data?.error;

      let message = "Erro ao criar empresa";

      if (backendError?.includes("CNPJ")) {
        message = "Já existe uma empresa cadastrada com este CNPJ";
      }

      if (backendError?.includes("E-mail")) {
        message = "Este e-mail já está em uso";
      }

      setToast({
        message,
        type: "error",
      });
    }
  }

  return (
    <div className="auth-container">
      <Toast message={toast.message} type={toast.type} />

      <div className="auth-box">
        <div className="progress-bar">
          <div className={`progress step-${step}`} />
        </div>

        <h2>{step === 1 ? "Dados da empresa" : "Usuário responsável"}</h2>

        <form onSubmit={handleSubmit}>
          {/* ===============================
              STEP 1 – COMPANY
          ================================ */}
          {step === 1 && (
            <>
              <input
                placeholder="Nome fantasia"
                value={company.fantasyName}
                onChange={(e) =>
                  setCompany({ ...company, fantasyName: e.target.value })
                }
              />
              {errors.fantasyName && <span className="error">{errors.fantasyName}</span>}

              <input
                placeholder="Razão social"
                value={company.corporateName}
                onChange={(e) =>
                  setCompany({ ...company, corporateName: e.target.value })
                }
              />
              {errors.corporateName && <span className="error">{errors.corporateName}</span>}

              <input
                placeholder="CNPJ"
                value={company.document}
                onChange={(e) =>
                  setCompany({ ...company, document: maskCNPJ(e.target.value) })
                }
              />
              {errors.document && <span className="error">{errors.document}</span>}

              <input
                placeholder="E-mail da empresa"
                value={company.email}
                onChange={(e) =>
                  setCompany({ ...company, email: e.target.value })
                }
              />
              {errors.email && <span className="error">{errors.email}</span>}

              <input
                placeholder="Telefone da empresa"
                value={company.phone}
                onChange={(e) =>
                  setCompany({ ...company, phone: maskPhone(e.target.value) })
                }
              />
              <small className="hint">
                📞 Este telefone será usado para receber pedidos e contatos de clientes
              </small>
              {errors.phone && <span className="error">{errors.phone}</span>}

              <label className="file-label">
                Imagem da empresa (opcional)
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>

              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="logo-preview" />
              )}

              {errors.image && <span className="error">{errors.image}</span>}

              <button type="button" onClick={() => validateStep1() && setStep(2)}>
                Próximo
              </button>
            </>
          )}

          {/* ===============================
              STEP 2 – USER
          ================================ */}
          {step === 2 && (
            <>
              <input
                placeholder="Nome completo"
                value={user.name}
                onChange={(e) =>
                  setUser({ ...user, name: e.target.value })
                }
              />
              {errors.name && <span className="error">{errors.name}</span>}

              <input
                placeholder="E-mail"
                value={user.email}
                onChange={(e) =>
                  setUser({ ...user, email: e.target.value })
                }
              />
              {errors.email && <span className="error">{errors.email}</span>}

              <input
                type="password"
                placeholder="Senha"
                value={user.password}
                onChange={(e) =>
                  setUser({ ...user, password: e.target.value })
                }
              />
              {errors.password && <span className="error">{errors.password}</span>}

              <input
                placeholder="CPF"
                value={user.cpf}
                onChange={(e) =>
                  setUser({ ...user, cpf: maskCPF(e.target.value) })
                }
              />
              {errors.cpf && <span className="error">{errors.cpf}</span>}

              <div className="actions">
                <button type="button" className="secondary" onClick={() => setStep(1)}>
                  Voltar
                </button>
                <button type="submit">Criar empresa</button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
