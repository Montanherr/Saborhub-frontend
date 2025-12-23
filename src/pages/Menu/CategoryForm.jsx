import { useState, useEffect } from "react"; // Importação correta do React
import "./form-system.css";

export default function CategoryForm({
  onSubmit,
  editingCategory,
  onCancelEdit,
}) {
  const [name, setName] = useState("");

  // 🔥 SINCRONIZA COM EDIÇÃO
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
    } else {
      setName("");
    }
  }, [editingCategory]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name); // Chama a função onSubmit passando o nome da categoria
    setName(""); // Limpa o campo após o envio
  }

  return (
    <div className="form-box">
      <h2>{editingCategory ? "Editar Categoria" : "Cadastrar Categoria"}</h2>

      <form onSubmit={handleSubmit}>
        <label>Nome da Categoria</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)} // Atualiza o nome conforme o usuário digita
          placeholder="Nome da categoria"
          required
        />
        <button type="submit">
          {editingCategory ? "Salvar Alterações" : "Salvar Categoria"} {/* Texto do botão dependendo do estado */}
        </button>

        {/* Se estivermos editando, mostra o botão de cancelar */}
        {editingCategory && (
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancelEdit} // Chama a função de cancelamento
          >
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
}
