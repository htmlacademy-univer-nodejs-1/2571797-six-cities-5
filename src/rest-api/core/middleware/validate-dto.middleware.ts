import { Request, Response, NextFunction } from 'express';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { injectable } from 'inversify';
import { Middleware } from './middleware.interface.js';
import { ValidationException } from '../../exceptions/app.exception.js';

@injectable()
export class ValidateDtoMiddleware implements Middleware {
  constructor(
    private readonly dtoClass: ClassConstructor<object>,
    private readonly requireAllFields = false
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const dto = plainToInstance(this.dtoClass, req.body, {
      enableImplicitConversion: true,
      excludeExtraneousValues: false
    });
    const errors = await validate(dto, {
      skipMissingProperties: !this.requireAllFields,
      whitelist: false,
      forbidNonWhitelisted: false
    });

    if (errors.length > 0) {
      const errorMessages = this.formatValidationErrors(errors);
      throw new ValidationException(`Validation failed: ${errorMessages.join(', ')}`);
    }

    req.body = dto;
    next();
  }

  private formatValidationErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    errors.forEach((error) => {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }

      if (error.children && error.children.length > 0) {
        messages.push(...this.formatValidationErrors(error.children));
      }
    });

    return messages;
  }
}

