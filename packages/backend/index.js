import "dotenv/config";

import { crearApp } from "./src/app.js";

const app = crearApp();

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Backend escuchando en puerto ${process.env.SERVER_PORT}`);
});
