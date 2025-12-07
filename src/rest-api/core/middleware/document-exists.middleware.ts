import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { Middleware } from './middleware.interface.js';
import { DocumentExistsService } from '../../interfaces/database.interface.js';
import { NotFoundException } from '../../exceptions/app.exception.js';

@injectable()
export class DocumentExistsMiddleware<TDocument> implements Middleware {
  constructor(
    private readonly service: DocumentExistsService<TDocument>,
    private readonly paramName: string = 'id',
    private readonly storePropertyName?: string,
    private readonly notFoundMessage: string = 'Resource not found'
  ) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const documentId = req.params[this.paramName];

    if (!documentId) {
      return next();
    }

    const document = await this.service.findById(documentId);

    if (!document) {
      throw new NotFoundException(this.notFoundMessage);
    }

    if (this.storePropertyName) {
      res.locals[this.storePropertyName] = document;
    }

    next();
  }
}


