import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

// Criamos a instância FORA de qualquer componente ou função de renderização
export const socket = io(SOCKET_URL, {
  autoConnect: false, // 👈 Importante: não conecta automaticamente ao importar
  transports: ["websocket"], // 👈 Mude para apenas websocket para pular o polling instável
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 5000,
});

// Função para conectar apenas quando necessário
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};