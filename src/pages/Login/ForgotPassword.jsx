import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <main className="login-container">
      <div className="brand-area">
        <h1 className="app-title">SaborHub</h1>
        <p className="subtitle">Recupere o acesso ao painel do seu estabelecimento.</p>
      </div>
      <section className="login-box recovery-box" aria-labelledby="recovery-title">
        <span className="recovery-icon" aria-hidden="true">✉</span>
        <h2 id="recovery-title">Recuperar senha</h2>
        {submitted ? (
          <div className="recovery-success" role="status">
            <strong>Solicitação registrada</strong>
            <p>O e-mail informado foi preparado para a recuperação. O envio do link será ativado após configurar o serviço de e-mail do servidor.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="recovery-copy">Informe seu e-mail cadastrado para iniciar uma solicitação segura de redefinição.</p>
            <div className="input-group">
              <label htmlFor="recovery-email">E-mail cadastrado</label>
              <input id="recovery-email" type="email" autoComplete="email" placeholder="seu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <button type="submit">Solicitar recuperação</button>
          </form>
        )}
        <div className="login-footer"><Link className="link-btn" to="/login">Voltar para o login</Link></div>
      </section>
    </main>
  );
}
