import { Request, Response, Router } from 'express';
import { injectable, inject } from 'inversify';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { Controller } from '../../core/controller/controller.abstract.js';
import { CommentDatabaseService, OfferDatabaseService } from '../../interfaces/database.interface.js';
import { CreateCommentDto } from '../../dto';
import { transformCommentToResponse } from '../../utils/response-transformers.js';
import { NotFoundException, UnauthorizedException } from '../../exceptions/app.exception.js';
import { AuthService } from '../../services/auth.service.js';
import { ValidateObjectIdMiddleware } from '../../core/middleware/validate-objectid.middleware.js';
import { ValidateDtoMiddleware } from '../../core/middleware/validate-dto.middleware.js';
import { DocumentExistsMiddleware } from '../../core/middleware/document-exists.middleware.js';
import { AuthMiddleware } from '../../core/middleware/auth.middleware.js';
import { OfferDocument } from '../../models/offer.model.js';

const DEFAULT_COMMENTS_LIMIT = 50;

@injectable()
export class CommentController extends Controller {
  private readonly validateOfferIdMiddleware: ValidateObjectIdMiddleware;
  private readonly validateCreateCommentDtoMiddleware: ValidateDtoMiddleware;
  private readonly checkOfferExistsMiddleware: DocumentExistsMiddleware<OfferDocument>;
  private readonly authMiddleware: AuthMiddleware;

  constructor(
    @inject('CommentService') private readonly commentService: CommentDatabaseService,
    @inject('OfferService') private readonly offerService: OfferDatabaseService,
    @inject('AuthService') authService: AuthService
  ) {
    super();
    this.authService = authService;
    this.validateOfferIdMiddleware = new ValidateObjectIdMiddleware('offerId');
    this.validateCreateCommentDtoMiddleware = new ValidateDtoMiddleware(CreateCommentDto, true);
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

    router.get(
      '/:offerId/comments',
      asyncHandler(this.validateOfferIdMiddleware.execute.bind(this.validateOfferIdMiddleware)),
      asyncHandler(this.checkOfferExistsMiddleware.execute.bind(this.checkOfferExistsMiddleware)),
      asyncHandler(this.index.bind(this))
    );
    router.post(
      '/:offerId/comments',
      asyncHandler(this.validateOfferIdMiddleware.execute.bind(this.validateOfferIdMiddleware)),
      asyncHandler(this.authMiddleware.execute.bind(this.authMiddleware)),
      asyncHandler(this.validateCreateCommentDtoMiddleware.execute.bind(this.validateCreateCommentDtoMiddleware)),
      asyncHandler(this.checkOfferExistsMiddleware.execute.bind(this.checkOfferExistsMiddleware)),
      asyncHandler(this.create.bind(this))
    );

    return router;
  }

  private async index(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;

    const comments = await this.commentService.findByOfferId(offerId, DEFAULT_COMMENTS_LIMIT);
    const commentsResponse = comments.map((comment) => transformCommentToResponse(comment));

    this.ok(res, commentsResponse);
  }

  private async create(req: Request, res: Response): Promise<void> {
    const userId = await this.getUserIdFromRequest(req, true);
    const offer = res.locals.offer as OfferDocument;

    if (!userId) {
      throw new UnauthorizedException();
    }

    const dto = req.body as CreateCommentDto;
    const commentData = {
      ...dto,
      author: new Types.ObjectId(userId),
      offer: new Types.ObjectId(offer._id.toString())
    };

    const comment = await this.commentService.create(commentData);
    const commentWithAuthor = await this.commentService.findById(comment._id.toString());

    if (!commentWithAuthor) {
      throw new NotFoundException('Comment not found after creation');
    }

    const commentResponse = transformCommentToResponse(commentWithAuthor);
    this.created(res, commentResponse);
  }
}

