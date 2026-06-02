import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError || err.name === "ZodError") {
    console.warn("Validation Error:", err.errors || err.message);
    return res.status(400).json({
      statusCode: 400,
      message: "Validation failed",
      details: err.errors,
    });
  }

  if (err instanceof HttpError) {
    const body = { statusCode: err.statusCode, message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ statusCode: status, message });
};

