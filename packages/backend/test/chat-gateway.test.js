import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";
import { WebSocket } from "ws";
import { ChatGateway } from "../src/services/ChatGateway.js";

class FakeSocket extends EventEmitter {
  constructor() {
    super();
    this.readyState = WebSocket.OPEN;
    this.sent = [];
  }

  send(payload) { this.sent.push(JSON.parse(payload)); }
  close() { this.readyState = WebSocket.CLOSED; this.emit("close"); }
  ping() {}
}

describe("ChatGateway", () => {
  it("autentica participantes y distribuye el mensaje por compra", () => {
    const authService = {
      verificarToken(token) {
        const users = {
          "token-comprador": { id: "comprador-1" },
          "token-organizador": { id: "organizador-1" },
        };
        if (!users[token]) throw new Error("Token inválido");
        return users[token];
      },
    };
    const gateway = new ChatGateway({ authService });
    const conectar = (token) => {
      const socket = new FakeSocket();
      gateway.webSocketServer.emit("connection", socket);
      socket.emit("message", Buffer.from(JSON.stringify({ type: "authenticate", token })));
      assert.equal(socket.sent[0].type, "ready");
      return socket;
    };

    try {
      const comprador = conectar("token-comprador");
      const organizador = conectar("token-organizador");
      gateway.publicarMensaje({
        compra: { id: "compra-1", comprador: { id: "comprador-1" }, evento: { organizador: { id: "organizador-1" } } },
        mensaje: {
          id: "mensaje-1",
          usuario: { id: "comprador-1", nombre: "Ana", apellido: "Pérez" },
          mensaje: "Hola",
          enviado: new Date(),
        },
        rol: "comprador",
      });

      assert.equal(comprador.sent[1].type, "new_message");
      assert.equal(organizador.sent[1].compraId, "compra-1");
      assert.equal(organizador.sent[1].message.text, "Hola");
      assert.equal(organizador.sent[1].message.senderRole, "buyer");
    } finally {
      for (const clients of gateway.clientsByUser.values()) {
        for (const client of clients) client.close();
      }
      clearInterval(gateway.heartbeat);
    }
  });

  it("cierra una conexión cuando el JWT no es válido", () => {
    const gateway = new ChatGateway({ authService: { verificarToken() { throw new Error("JWT inválido"); } } });
    const socket = new FakeSocket();
    gateway.webSocketServer.emit("connection", socket);
    socket.emit("message", Buffer.from(JSON.stringify({ type: "authenticate", token: "inválido" })));

    assert.equal(socket.sent[0].type, "error");
    assert.equal(socket.readyState, WebSocket.CLOSED);
    clearInterval(gateway.heartbeat);
  });
});
