import { Request, Response, Router } from 'express';
import { injectable, inject } from 'inversify';
import asyncHandler from 'express-async-handler';
import { Controller } from '../../core/controller/controller.abstract.js';
import { OfferDatabaseService } from '../../interfaces/database.interface.js';
import { transformOfferToListItem } from '../../utils/response-transformers.js';
import { UnauthorizedException } from '../../exceptions/app.exception.js';
import { AuthService } from '../../services/auth.service.js';

@injectable()
export class FavoriteController extends Controller {
  constructor(
    @inject('OfferService') private readonly offerService: OfferDatabaseService,
    @inject('AuthService') private readonly authService: AuthService
  ) {
    super();
  }

  public getRouter(): Router {
    const router = Router();

    router.get('/', asyncHandler(this.index.bind(this)));
    router.post('/:offerId', asyncHandler(this.create.bind(this)));
    router.delete('/:offerId', asyncHandler(this.delete.bind(this)));

    return router;
  }

  private async index(req: Request, res: Response): Promise<void> {
    const userId = await this.getUserIdFromRequest(req, true);
    if (!userId) {
      throw new UnauthorizedException();
    }

    const offers = await this.offerService.findFavoritesByUserId(userId);
    const offersResponse = offers.map((offer) => transformOfferToListItem(offer, true));

    this.ok(res, offersResponse);
  }

  private async create(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const userId = await this.getUserIdFromRequest(req, true);
    if (!userId) {
      throw new UnauthorizedException();
    }

    await this.offerService.addToFavorites(userId, offerId);
    this.created(res, {});
  }

  private async delete(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const userId = await this.getUserIdFromRequest(req, true);
    if (!userId) {
      throw new UnauthorizedException();
    }

    await this.offerService.removeFromFavorites(userId, offerId);
    this.noContent(res);
  }

  private async getUserIdFromRequest(req: Request, required = false): Promise<string | undefined> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (required) {
        throw new UnauthorizedException();
      }
      return undefined;
    }

    const token = authHeader.substring(7);
    const user = await this.authService.getUserByToken(token);

    if (!user) {
      if (required) {
        throw new UnauthorizedException();
      }
      return undefined;
    }

    return user._id.toString();
  }
}

