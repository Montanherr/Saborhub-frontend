import { io } from "socket.io-client";

export const socket = io(
  "https://saborhub-backend-f7c4f594841a.herokuapp.com",
  {
    autoConnect: false,
    transports: ["websocket"],
  }
);
