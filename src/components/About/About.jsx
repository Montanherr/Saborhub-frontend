import { Link } from "react-router-dom";
import "./About.css";

export default function AboutMenu() {
  return (
    <section className="about-container">
      <div className="about-content">
        <span className="about-eyebrow">CARDÁPIO DIGITAL PARA RESTAURANTES</span>
        <h1 className="about-title">
          Seu restaurante mais <span>organizado e acessível</span>
        </h1>

        <p className="about-text">
          Crie um cardápio digital completo, apresente seus produtos com clareza
          e permita que seus clientes façam pedidos pelo celular.
        </p>

        <div className="about-actions">
          <Link className="about-primary-action" to="/register">
            Criar meu cardápio <span aria-hidden="true">→</span>
          </Link>
          <span className="about-action-note">Compartilhe por um único link</span>
        </div>

        <div className="about-benefits" aria-label="Benefícios do SaborHub">
          <div className="about-benefit">
            <span className="about-benefit-icon">✓</span>
            <div><strong>Mais praticidade</strong><small>Produtos e preços organizados</small></div>
          </div>
          <div className="about-benefit">
            <span className="about-benefit-icon">⌁</span>
            <div><strong>Acesso rápido</strong><small>Experiência pensada para celular</small></div>
          </div>
          <div className="about-benefit">
            <span className="about-benefit-icon">↗</span>
            <div><strong>Mais alcance</strong><small>Um link para divulgar seu menu</small></div>
          </div>
        </div>
      </div>

      <div className="about-preview" aria-label="Prévia ilustrativa do cardápio digital">
        <div className="preview-window-bar">
          <span className="preview-dot" />
          <span className="preview-dot" />
          <span className="preview-dot" />
          <span className="preview-address">saborhub.app/cardapio</span>
        </div>
        <div className="preview-body">
          <div className="preview-brand">
            <span className="preview-brand-mark">S</span>
            <div><strong>SaborHub</strong><small>Cardápio digital</small></div>
          </div>
          <div className="preview-highlight"><span>Seu menu em um só lugar</span><b>↗</b></div>
          <div className="preview-section-title">Categorias</div>
          <div className="preview-chips"><span>Mais pedidos</span><span>Novidades</span><span>Combos</span></div>
          <div className="preview-product"><span className="preview-product-image" /><div><strong>Produtos organizados</strong><small>Descrição, preço e disponibilidade</small></div></div>
          <div className="preview-product second"><span className="preview-product-image" /><div><strong>Pedidos pelo celular</strong><small>Uma experiência simples para o cliente</small></div></div>
        </div>
      </div>
    </section>
  );
}
