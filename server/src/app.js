import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import api from "./routes/api.js";
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));
app.use("/api", api);
app.use("/api", (_req, res) =>
  res
    .status(404)
    .json({ success: false, message: "El endpoint solicitado no existe." }),
);
if (process.env.NODE_ENV === "production") {
  const client = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../client/dist",
  );
  app.use(express.static(client));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(path.join(client, "index.html")),
  );
}
app.use(errorHandler);
export default app;
