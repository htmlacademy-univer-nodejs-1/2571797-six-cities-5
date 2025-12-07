import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export abstract class Controller {
  protected send<T>(res: Response, statusCode: number, data: T): void {
    res.status(statusCode).json(data);
  }

  protected ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }

  protected created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  protected noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send();
  }
}

