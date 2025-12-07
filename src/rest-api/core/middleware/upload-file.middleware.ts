import path from 'node:path';
import {promises as fs} from 'node:fs';
import multer, {StorageEngine} from 'multer';
import {NextFunction, Request, RequestHandler, Response} from 'express';
import type {ParamsDictionary} from 'express-serve-static-core';
import {extension} from 'mime-types';
import {nanoid} from 'nanoid';
import {injectable} from 'inversify';
import {Middleware} from './middleware.interface.js';
import {BadRequestException} from '../../exceptions/app.exception.js';

type RequestWithFile = Request<ParamsDictionary> & { file?: Express.Multer.File };

@injectable()
export class UploadFileMiddleware implements Middleware {
  private readonly uploadDirectory: string;
  private readonly publicPath: string;
  private readonly uploadMiddleware: RequestHandler;

  constructor(uploadDirectory: string, private readonly fieldName: string, publicPath = '/upload') {
    this.uploadDirectory = path.resolve(uploadDirectory);
    this.publicPath = publicPath;

    const storage: StorageEngine = multer.diskStorage({
      destination: async (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        try {
          await fs.mkdir(this.uploadDirectory, { recursive: true });
          return cb(null, this.uploadDirectory);
        } catch (error) {
          const uploadError = error instanceof Error ? error : new Error('Failed to prepare upload directory');
          return cb(uploadError, this.uploadDirectory);
        }
      },
      filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const fileExtension = this.getFileExtension(file);
        return cb(null, `${nanoid()}.${fileExtension}`);
      }
    });

    this.uploadMiddleware = multer({
      storage,
      fileFilter: (_req, file, cb) => {
        const isAllowedMime = ['image/jpeg', 'image/png'].includes(file.mimetype);
        if (!isAllowedMime) {
          return cb(new BadRequestException('Avatar must be a .jpg or .png image'));
        }
        return cb(null, true);
      }
    }).single(this.fieldName);
  }

  public execute(req: Request, res: Response, next: NextFunction): void {
    const requestWithFile = req as RequestWithFile;

    this.uploadMiddleware(requestWithFile, res, (error) => {
      if (error) {
        return next(error);
      }

      if (requestWithFile.file) {
        res.locals.uploadedFilePath = path.posix.join(this.publicPath, requestWithFile.file.filename);
      }

      next();
    });
  }

  private getFileExtension(file: Express.Multer.File): string {
    const mimeTypeExt = extension(file.mimetype);
    const originalExt = path.extname(file.originalname).replace('.', '');

    if (typeof mimeTypeExt === 'string' && mimeTypeExt.length > 0) {
      return mimeTypeExt;
    }

    if (originalExt) {
      return originalExt;
    }

    return 'bin';
  }
}


