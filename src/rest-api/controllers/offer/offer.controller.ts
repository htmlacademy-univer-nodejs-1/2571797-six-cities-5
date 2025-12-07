import { Request, Response, Router } from 'express';
import { injectable, inject } from 'inversify';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { Controller } from '../../core/controller/controller.abstract.js';
import { OfferDatabaseService } from '../../interfaces/database.interface.js';
import { CreateOfferDto, UpdateOfferDto } from '../../dto';
import { transformOfferToListItem, transformOfferToResponse } from '../../utils/response-transformers.js';
import { NotFoundException, ForbiddenException, UnauthorizedException } from '../../exceptions/app.exception.js';
import { AuthService } from '../../services/auth.service.js';
import { OfferDocument } from '../../models/offer.model.js';
import { UserDocument } from '../../models/user.model.js';
import { ValidateObjectIdMiddleware } from '../../core/middleware/validate-objectid.middleware.js';
import { ValidateDtoMiddleware } from '../../core/middleware/validate-dto.middleware.js';
import { DocumentExistsMiddleware } from '../../core/middleware/document-exists.middleware.js';
import { AuthMiddleware } from '../../core/middleware/auth.middleware.js';

const DEFAULT_OFFERS_LIMIT = 60;
const PREMIUM_OFFERS_LIMIT = 3;
const PARSE_RADIX = 10;

@injectable()
export class OfferController extends Controller {
  private readonly validateOfferIdMiddleware: ValidateObjectIdMiddleware;
  private readonly validateCreateOfferDtoMiddleware: ValidateDtoMiddleware;
  private readonly validateUpdateOfferDtoMiddleware: ValidateDtoMiddleware;
  private readonly checkOfferExistsMiddleware: DocumentExistsMiddleware<OfferDocument>;
  private readonly authMiddleware: AuthMiddleware;

  constructor(
    @inject('OfferService') private readonly offerService: OfferDatabaseService,
    @inject('AuthService') authService: AuthService
  ) {
    super();
    this.authService = authService;
    this.validateOfferIdMiddleware = new ValidateObjectIdMiddleware('offerId');
    this.validateCreateOfferDtoMiddleware = new ValidateDtoMiddleware(CreateOfferDto, true);
    this.validateUpdateOfferDtoMiddleware = new ValidateDtoMiddleware(UpdateOfferDto, false);
    this.checkOfferExistsMiddleware = new DocumentExistsMiddleware<OfferDocument>(
      this.offerService,
      'offerId',
      'offer',
      'Offer not found'
    );
    this.authMiddleware = new AuthMiddleware(authService);
  }

  public getRouter(): Router {
    const router = Router();

    router.get('/', asyncHandler(this.index.bind(this)));
    router.post(
      '/',
      asyncHandler(this.authMiddleware.execute.bind(this.authMiddleware)),
      asyncHandler(this.validateCreateOfferDtoMiddleware.execute.bind(this.validateCreateOfferDtoMiddleware)),
      asyncHandler(this.create.bind(this))
    );
    router.get('/premium/:city', asyncHandler(this.getPremium.bind(this)));
    router.get(
      '/:offerId',
      asyncHandler(this.validateOfferIdMiddleware.execute.bind(this.validateOfferIdMiddleware)),
      asyncHandler(this.checkOfferExistsMiddleware.execute.bind(this.checkOfferExistsMiddleware)),
      asyncHandler(this.show.bind(this))
    );
    router.patch(
      '/:offerId',
      asyncHandler(this.validateOfferIdMiddleware.execute.bind(this.validateOfferIdMiddleware)),
      asyncHandler(this.authMiddleware.execute.bind(this.authMiddleware)),
      asyncHandler(this.validateUpdateOfferDtoMiddleware.execute.bind(this.validateUpdateOfferDtoMiddleware)),
      asyncHandler(this.checkOfferExistsMiddleware.execute.bind(this.checkOfferExistsMiddleware)),
      asyncHandler(this.update.bind(this))
    );
    router.delete(
      '/:offerId',
      asyncHandler(this.validateOfferIdMiddleware.execute.bind(this.validateOfferIdMiddleware)),
      asyncHandler(this.authMiddleware.execute.bind(this.authMiddleware)),
      asyncHandler(this.checkOfferExistsMiddleware.execute.bind(this.checkOfferExistsMiddleware)),
      asyncHandler(this.delete.bind(this))
    );

    return router;
  }

  private async index(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, PARSE_RADIX) : DEFAULT_OFFERS_LIMIT;
    const userId = await this.getUserIdFromRequest(req);

    const offers = await this.offerService.findAllWithFavorites(userId, limit);
    const offersResponse = offers.map((offer) => {
      const isFavorite = userId ? ((offer as OfferDocument & { isFavorite?: boolean }).isFavorite || false) : false;
      return transformOfferToListItem(offer, isFavorite);
    });

    this.ok(res, offersResponse);
  }

  private async create(req: Request, res: Response): Promise<void> {
    const userId = await this.getUserIdFromRequest(req, true);
    if (!userId) {
      throw new UnauthorizedException();
    }

    const dto = req.body as CreateOfferDto;
    const offerData = {
      ...dto,
      author: new Types.ObjectId(userId)
    };

    const offer = await this.offerService.create(offerData);
    const offerWithAuthor = await this.offerService.findById(offer._id.toString());

    if (!offerWithAuthor) {
      throw new NotFoundException('Offer not found after creation');
    }

    const offerResponse = transformOfferToResponse(offerWithAuthor, false);

    this.created(res, offerResponse);
  }

  private async show(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const userId = await this.getUserIdFromRequest(req);
    const offer = await this.offerService.findByIdWithFavorites(offerId, userId);

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const isFavorite = userId
      ? ((offer as OfferDocument & { isFavorite?: boolean }).isFavorite || false)
      : false;
    const offerResponse = transformOfferToResponse(offer, isFavorite);

    this.ok(res, offerResponse);
  }

  private async update(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const userId = await this.getUserIdFromRequest(req, true);
    const offer = res.locals.offer as OfferDocument;

    this.ensureOfferOwner(offer, userId);

    const dto = req.body as UpdateOfferDto;
    const updatedOffer = await this.offerService.update(offerId, dto);

    if (!updatedOffer) {
      throw new NotFoundException('Offer not found');
    }

    const isFavorite = await this.offerService.isFavorite(userId, offerId);
    const offerResponse = transformOfferToResponse(updatedOffer, isFavorite);

    this.ok(res, offerResponse);
  }

  private async delete(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const userId = await this.getUserIdFromRequest(req, true);
    const offer = res.locals.offer as OfferDocument;

    this.ensureOfferOwner(offer, userId);

    await this.offerService.delete(offerId);
    this.noContent(res);
  }

  private ensureOfferOwner(offer: OfferDocument, userId: string | undefined): void {
    const author = offer.author as UserDocument;
    const offerAuthorId = author._id?.toString() || (offer.author as unknown as { toString(): string }).toString();

    if (offerAuthorId !== userId) {
      throw new ForbiddenException();
    }
  }

  private async getPremium(req: Request, res: Response): Promise<void> {
    const { city } = req.params;
    const userId = await this.getUserIdFromRequest(req);

    const offers = await this.offerService.findPremiumByCityWithFavorites(city, userId, PREMIUM_OFFERS_LIMIT);
    const offersResponse = offers.map((offer) => {
      const isFavorite = userId ? ((offer as OfferDocument & { isFavorite?: boolean }).isFavorite || false) : false;
      return transformOfferToListItem(offer, isFavorite);
    });

    this.ok(res, offersResponse);
  }
}

