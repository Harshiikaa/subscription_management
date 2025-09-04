class AppError extends Error {
  constructor(message, statusCode = 500, errors = [], metadata = {}) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.metadata = metadata;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static fromValidation(message, errors = [], metadata = {}) {
    return new AppError(message, 400, errors, metadata);
  }

  static badRequest(message, field = null, metadata = {}) {
    return new AppError(
      message,
      400,
      field ? [{ field, message }] : [],
      metadata
    );
  }

  static unauthorized(message = "Unauthorized", metadata = {}) {
    return new AppError(message, 401, [], metadata);
  }

  static forbidden(message = "Forbidden", metadata = {}) {
    return new AppError(message, 403, [], metadata);
  }

  static notFound(message, field = null, metadata = {}) {
    return new AppError(
      message,
      404,
      field ? [{ field, message }] : [],
      metadata
    );
  }

  static conflict(message, field = null, metadata = {}) {
    return new AppError(
      message,
      409,
      field ? [{ field, message }] : [],
      metadata
    );
  }

  static internal(message = "Internal Server Error", metadata = {}) {
    return new AppError(message, 500, [], metadata);
  }
}

module.exports = AppError;
