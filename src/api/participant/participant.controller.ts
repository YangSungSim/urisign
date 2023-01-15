import { Router } from 'express';
import { BadRequestException, UnauthorizedException } from '../../common/exceptions';
import { Controller } from '../../common/interfaces/controller.interface';
import { Handler, wrap } from '../../lib/request-handler';
import { SignDto, SignResponse } from './dto/sign.dto';
import { ParticipantTokenDto, ParticipantTokenResponse } from './dto/token.dto';
import { ParticipantRepository } from './participant.repository';
import { ParticipantService } from './participant.service';

export default class ParticipantController implements Controller {
  path = '/participant';
  router = Router();

  participantService = new ParticipantService(
    new ParticipantRepository(),
  );

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    const router = Router();

    router
      .post('/token', wrap(this.token))
      .get('/document', wrap(this.readDocument))
      .post('/sign', wrap(this.sign));

    this.router.use(this.path, router);
  }

  token: Handler = (req): ParticipantTokenResponse => {
    const { documentId, email } = req.body as ParticipantTokenDto;

    const [token, participant] = this.participantService.issueAccessToken({
      documentId,
      email,
    });

    req.session.email = participant.email;
    req.session.documentId = participant.documentId;

    return {
      token,
      participant,
    };
  }

  readDocument: Handler = (req, res) => {
    console.log("readdocument: >>>>>");
    console.log(req.session.documentId);
    if (!req.session.documentId) {
      throw new UnauthorizedException();
    }

    const document_id = req.session.documentId;
    const email = req.session.email;
    const document = this.participantService.readDocument(document_id, email);
    
    return {document};
  }

  sign: Handler = async (req): Promise<SignResponse> => {
    if (!req.session.documentId) {
      throw new UnauthorizedException();
    }

    const { signature } = req.body as SignDto;

    if (!signature) {
      throw new BadRequestException('서명은 필수입니다.');
    }

    let result = null;
    const document_id = req.session.documentId;
    const email = req.session.email;
    result = this.participantService.sign(signature,document_id,email);
    
    return result;
  }
}
