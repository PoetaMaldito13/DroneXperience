export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
export function ensure(condition, message, status = 422) {
  if (!condition) throw new AppError(status, message);
}
export function found(row) {
  ensure(row, "El registro no existe o ya fue eliminado.", 404);
  return row;
}
