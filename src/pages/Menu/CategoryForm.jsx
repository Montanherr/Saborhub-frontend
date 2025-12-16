import { useState } from "react";

export default function CategoryForm({ onSubmit }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(name);
    setName("");
  }

  return (
    <div className="form-box">
      <h2>Cadastrar Categoria</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome da Categoria</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <button type="submit">Salvar Categoria</button>
      </form>
    </div>
  );
}
