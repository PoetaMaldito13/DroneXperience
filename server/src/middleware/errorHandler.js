import { ZodError } from "zod";
export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError)
    return res.status(422).json({
      success: false,
      message: "Revisa los campos indicados.",
      details: error.flatten().fieldErrors,
    });
  const postgres = {
    23505: [409, "Ya existe un registro con ese identificador."],
    23503: [
      409,
      "El registro está relacionado con otros datos o la selección ya no existe.",
    ],
    23514: [422, "Los valores no cumplen las reglas del modelo."],
    23502: [422, "Faltan campos obligatorios."],
    22003: [422, "Un número excede el rango permitido."],
    "22P02": [422, "Un valor tiene un formato inválido."],
  };
  const known = postgres[error.code];
  const status =
    known?.[0] ||
    error.status ||
    (error instanceof SyntaxError && "body" in error ? 400 : 503);
  res.status(status).json({
    success: false,
    message:
      known?.[1] ||
      (error.status
        ? error.message
        : status === 400
          ? "El contenido enviado no es válido."
          : "No se pudo acceder al servicio de datos. Revisa la conexión PostgreSQL y vuelve a intentar."),
    ...(error.details ? { details: error.details } : {}),
  });
}
