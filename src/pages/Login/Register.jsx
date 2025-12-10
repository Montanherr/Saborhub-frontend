import { useState } from 'react';
import './Register.css';

export default function Register({ onRegister, onRegisterCompany }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Digite seu nome completo";
    if (!form.email.includes('@')) newErrors.email = "E-mail inválido";
    if (form.password.length < 6) newErrors.password = "A senha deve ter ao menos 6 caracteres";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onRegister(form);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Cadastrar</h2>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <input
              type="text"
              name="fullName"
              placeholder="Nome Completo"
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <span className="error">{errors.fullName}</span>}
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button type="submit" className="submit-btn">
            Criar conta
          </button>
        </form>

        <button className="company-btn" onClick={onRegisterCompany}>
          Possuo empresa
        </button>
      </div>
    </div>
  );
}
