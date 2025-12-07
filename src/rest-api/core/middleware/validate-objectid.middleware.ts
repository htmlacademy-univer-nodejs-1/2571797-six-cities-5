import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { injectable } from 'inversify';
import { Middleware } from './middleware.interface.js';
import { BadRequestException } from '../../exceptions/app.exception.js';

@injectable()
export class ValidateObjectIdMiddleware implements Middleware {
  constructor(private readonly paramName: string = 'id') {}

  public execute(req: Request, _res: Response, next: NextFunction): void {
    const paramValue = req.params[this.paramName];

    if (!paramValue) {
      return next();
    }

    if (!Types.ObjectId.isValid(paramValue)) {
      throw new BadRequestException(`Invalid ${this.paramName}: ${paramValue}`);
    }

    next();
  }
}

