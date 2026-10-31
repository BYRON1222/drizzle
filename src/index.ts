import { app } from "./app.js";
import { pool } from "./db/index.js";

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => {
  console.log(`API de biblioteca escuchando en http://localhost:${port}`);
});

function shutdown() {
  console.log("Cerrando servidor...");
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
