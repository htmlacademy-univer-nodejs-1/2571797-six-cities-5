import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'pino';
import { injectable, inject } from 'inversify';
import { AppException } from '../../exceptions/app.exception.js';
import { ExceptionFilter as IExceptionFilter } from './exception-filter.interface.js';

@injectable()
export class ExceptionFilter implements IExceptionFilter {
  constructor(
    @inject('Logger') private readonly logger: Logger
  ) {}

  public catch(error: Error, req: Request, res: Response, next: NextFunction): void {
    if (res.headersSent) {
      return next(error);
    }

    if (error instanceof AppException) {
      this.logger.error({
        message: error.message,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
        path: req.path,
        method: req.method
      });

      res.status(error.statusCode).json({
        message: error.message
      });
    } else {
      this.logger.error({
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error'
      });
    }
  }
}

