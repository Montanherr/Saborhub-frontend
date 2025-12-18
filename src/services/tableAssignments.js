// src/services/tableAssignments.js
import api from "./api"; // seu axios instance

const tableAssignmentsService = {
  // =============================
  // CLIENTE / MESA
  // =============================

  // Mesa chama o garçom (QR Code)
  callWaiter(tableId, companyId) {
    return api.post(`/table-assignments/${tableId}/call`, { companyId });
  },

  // =============================
  // GARÇOM
  // =============================

  // Listar mesas (calling / occupied)
  list(companyId) {
    return api.get("/table-assignments", { params: { companyId } });
  },

  // Garçom aceita atendimento
  accept(assignmentId) {
    return api.patch(`/table-assignments/${assignmentId}/accept`);
  },

  // Abrir mesa (garçom)
  open(tableId) {
    return api.post("/table-assignments", { tableId });
  },

  // Finalizar mesa (garçom)
  finish(assignmentId) {
    return api.patch(`/table-assignments/${assignmentId}/finish`);
  }
};

export default tableAssignmentsService;
