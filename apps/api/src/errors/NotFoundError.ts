import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(resource = "Resource", id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND");
  }
}
