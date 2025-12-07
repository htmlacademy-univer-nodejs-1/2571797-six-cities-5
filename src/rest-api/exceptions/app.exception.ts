export class AppException extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationException extends AppException {
  constructor(message: string) {
    super(message, 400);
  }
}

export class BadRequestException extends AppException {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class NotFoundException extends AppException {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super(message, 409);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class DatabaseException extends AppException {
  constructor(message = 'Database operation failed') {
    super(message, 500, false);
  }
}
