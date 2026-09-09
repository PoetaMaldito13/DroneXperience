import app from "./app.js";
import { pool } from "./config/database.js";
const port = Number(process.env.PORT || 3001);
const server = app.listen(port, process.env.HOST || "127.0.0.1", () =>
  process.stdout.write(
    "DroneXperience API disponible en el puerto " + port + "\n",
  ),
);
async function close() {
  server.close();
  await pool.end();
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
