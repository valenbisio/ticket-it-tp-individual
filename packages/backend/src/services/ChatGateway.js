import { WebSocket, WebSocketServer } from "ws";

const AUTH_TIMEOUT_MS = 8000;

export class ChatGateway {
  constructor({ authService }) {
    this.authService = authService;
    this.clientsByUser = new Map();
    this.webSocketServer = new WebSocketServer({ noServer: true });
    this.webSocketServer.on("connection", (socket) => this.#handleConnection(socket));
    this.heartbeat = setInterval(() => {
      for (const clients of this.clientsByUser.values()) {
        for (const client of clients) {
          if (!client.isAlive) {
            client.terminate();
            continue;
          }
          client.isAlive = false;
          client.ping();
        }
      }
    }, 30000);
    this.heartbeat.unref?.();
  }

  attach(server) {
    server.on("upgrade", (request, socket, head) => {
      const { pathname } = new URL(request.url, "http://localhost");
      if (pathname !== "/ws/chat") {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.destroy();
        return;
      }
      this.webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
        this.webSocketServer.emit("connection", webSocket, request);
      });
    });
  }

  publicarMensaje({ compra, mensaje, rol }) {
    const sender = mensaje.usuario;
    const payload = JSON.stringify({
      type: "new_message",
      compraId: compra.id,
      message: {
        id: mensaje.id,
        senderId: sender.id,
        senderName: [sender.nombre, sender.apellido].filter(Boolean).join(" "),
        senderRole: rol === "organizador" ? "organizer" : "buyer",
        text: mensaje.mensaje,
        sentAt: mensaje.enviado.toISOString(),
        timestamp: mensaje.enviado.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      },
    });
    const userIds = [compra.comprador?.id, compra.evento?.organizador?.id];
    for (const userId of userIds) {
      for (const client of this.clientsByUser.get(userId) ?? []) {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
      }
    }
  }

  #handleConnection(socket) {
    let userId = null;
    socket.isAlive = true;
    socket.on("error", () => {});
    socket.on("pong", () => { socket.isAlive = true; });
    const timeout = setTimeout(() => socket.close(1008, "Autenticación requerida"), AUTH_TIMEOUT_MS);
    socket.on("message", (rawMessage) => {
      if (userId) return;
      let request;
      try {
        request = JSON.parse(rawMessage.toString());
      } catch {
        socket.close(1008, "Mensaje de autenticación inválido");
        return;
      }
      if (request.type !== "authenticate" || typeof request.token !== "string") {
        socket.close(1008, "Autenticación requerida");
        return;
      }
      try {
        const user = this.authService.verificarToken(request.token);
        userId = user.id;
        clearTimeout(timeout);
        const clients = this.clientsByUser.get(userId) ?? new Set();
        clients.add(socket);
        this.clientsByUser.set(userId, clients);
        socket.send(JSON.stringify({ type: "ready" }));
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "La sesión no es válida" }));
        socket.close(1008, "Sesión no válida");
      }
    });
    socket.on("close", () => {
      clearTimeout(timeout);
      if (!userId) return;
      const clients = this.clientsByUser.get(userId);
      clients?.delete(socket);
      if (clients?.size === 0) this.clientsByUser.delete(userId);
    });
  }
}
