import "dotenv/config";

import app from "./src/app.js";

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Backend escuchando en puerto ${process.env.SERVER_PORT}`);
});
