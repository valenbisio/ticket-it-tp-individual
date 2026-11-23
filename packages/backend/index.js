import "dotenv/config";

import { createServer } from "node:http";
import app from "./src/app.js";
import { chatGateway } from "./src/routes/UsuariosRoute.js";

const server = createServer(app);
chatGateway.attach(server);
const port = process.env.SERVER_PORT || 8000;

server.listen(port, () => {
  console.log(`Backend escuchando en puerto ${port}`);
});
