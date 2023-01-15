import { Handler, Router } from 'express';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '../../common/exceptions';
import { Controller } from '../../common/interfaces/controller.interface';
import { wrap } from '../../lib/request-handler';
import { v4 as uuidv4 } from 'uuid';
import { DocumentRepository } from './document.repository';
import { DocumentService } from './document.service';
import { CreateDto, CreateResponse } from './dto/create.dto';

export default class DocumentController implements Controller {
  path = '/documents';
  router = Router();

  documentService = new DocumentService(
    new DocumentRepository(),
  );

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    const router = Router();

    router
      .post('/', wrap(this.create))
      .get('/', wrap(this.findAll))
      .get('/:documentId', wrap(this.findOne))
      .delete('/:documentId', wrap(this.remove))
      .post('/:documentId/publish', wrap(this.publish));

    this.router.use(this.path, router);
  }

  create: Handler = async (req, res): Promise<CreateResponse> => {
    const authorization = req.headers.authorization;

    if (!authorization){
      throw new UnauthorizedException();
    }

    const { title, content, participants } = req.body as CreateDto;
    
    if (!title) {
      throw new BadRequestException('제목은 필수입니다.');
    }

    if (!content) {
      throw new BadRequestException('내용은 필수입니다.');
    }

    if (participants.length < 2) {
      throw new BadRequestException('참가자는 최소 2명 이상이어야 합니다.');
    }

    if (participants.length > 10) {
      throw new BadRequestException('참가자는 10명을 초과할 수 없습니다.');
    }

    for (let i = 0; i<participants.length; i++) {
      if (!participants[i].name) {
        throw new BadRequestException('이름은 필수입니다.');
      }
  
      if (!participants[i].email) {
        throw new BadRequestException('이메일은 필수입니다.');
      }
    }
    

    const userId = req.session.userId;

    const documentId = await this.documentService.create({
      userId,
      title,
      content,
      participants
    });

    return {documentId};
  }

  findOne: Handler = (req, res) => {
    const authorization = req.headers.authorization;

    if (!authorization){
      throw new UnauthorizedException();
    }

    const documentId = req.params.documentId;
    const findById = this.documentService.findById(documentId);
    return {document: findById }
  }

  findAll: Handler = (req, res) => {
    const authorization = req.headers.authorization;

    if (!authorization){
      throw new UnauthorizedException();
    }

    const findAll = this.documentService.findAll();
    return findAll;
  }

  publish: Handler = (req, res) => {
    const authorization = req.headers.authorization;

    if (!authorization){
      throw new UnauthorizedException();
    }

    const document_id = req.params.documentId;
    let findByIdDocu = null;
    try {
      findByIdDocu = this.documentService.findById(document_id);
    } catch (e) {
      throw new NotFoundException();
    }
    
    const status = findByIdDocu.status;
    const ownderYn = findByIdDocu.user_id;

    if (ownderYn != req.session.userId) {
      throw new ForbiddenException();   //문서접근 권한이 없습니다.
    }

    if (status == "CREATED") {
      this.documentService.publish(document_id);
      return true;
    } else {
      throw new BadRequestException('문서 상태가 created가 아닙니다.');
    }
  }

  remove: Handler = (req, res) => {
    const authorization = req.headers.authorization;

    if (!authorization){
      throw new UnauthorizedException();
    }

    const document_id = req.params.documentId;
    let findByIdDocu = null;
    try {
      findByIdDocu = this.documentService.findById(document_id);
    } catch (e) {
      throw new NotFoundException();
    }
    
    const status = findByIdDocu.status;
    const ownderYn = findByIdDocu.user_id;

    if (ownderYn != req.session.userId) {
      throw new ForbiddenException();   //문서접근 권한이 없습니다.
    }

    if (status == "CREATED") {
      this.documentService.remove(document_id);
      return true;
    } else if (status == "DELETED") {
      return true;
    } else {
      throw new BadRequestException('문서 상태가 created가 아닙니다.');
    }
    
    
  }
}
