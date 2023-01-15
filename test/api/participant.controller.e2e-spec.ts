import request from 'supertest';
import { UUID } from '../../src/@types/datatype';
import {
  ParticipantTokenDto,
  ParticipantTokenResponse,
} from '../../src/api/participant/dto/token.dto';
import { Participant } from '../../src/api/participant/entities/participant.entity';
import { ParticipantRepository } from '../../src/api/participant/participant.repository';
import { verify } from '../../src/lib/jwt';
import { CSRF_TOKEN_HEADER } from '../../src/middlewares/csrf.middleware';
import { updateParticipantStatus } from '../lib/mockup';
import {
  createDocument,
  expectResponseFailed,
  expectResponseSucceed,
  fetchDocument,
  fetchHeaders,
  fetchUserTokenAndHeaders,
  getResponseData,
  getServer,
  Headers,
  publishDocument,
  withHeadersBy,
} from '../lib/utils';

describe('ParticipantController (e2e)', () => {
  const app = getServer();
  const req = request(app);

  const apiPath = '/api/participant';

  const participantRepository = new ParticipantRepository();

  let documentId: UUID;
  let participant: Participant;
  let document: any;

  beforeEach(async () => {
    const headers = await fetchUserTokenAndHeaders(req);

    documentId = await createDocument(req, headers);
    await publishDocument(req, headers, documentId);
    document = await fetchDocument(req, headers, documentId);
    participant = participantRepository.findById(document.participants[0].id);
  });

  async function fetchParticipantTokenAndCookie(): Promise<Headers> {
    const headers = await fetchHeaders(req);
    const withHeaders = withHeadersBy(headers);

    const params: ParticipantTokenDto = {
      documentId,
      email: participant.email,
    };

    // when
    const res = await withHeaders(req.post(`${apiPath}/token`))
      .send(params)
      .expect(200);

    const token = getResponseData(res).token;
    const cookie = headers.cookie;
    const csrfToken = res.header[CSRF_TOKEN_HEADER];

    return {
      token,
      cookie,
      csrfToken,
    };
  }

  describe('참가자 인증: POST /api/participant/token', () => {
    it('성공 - 참가자 인증 토큰 발급 (200)', async () => {
      // given
      const headers = await fetchHeaders(req);
      const withHeaders = withHeadersBy(headers);

      const params: ParticipantTokenDto = {
        documentId,
        email: participant.email,
      };

      // when
      const res = await withHeaders(req.post(`${apiPath}/token`))
        .send(params)
        .expect(200);

      // then
      expectResponseSucceed(res);

      const { token } = getResponseData(res) as ParticipantTokenResponse;
      expect(token).toBeTruthy();

      const decoded = verify(token);
      expect(decoded).toHaveProperty('participant_id', participant.id);
      expect(decoded).toHaveProperty('email', participant.email);
    });

    it('실패 - 참가자 정보를 찾을 수 없습니다. (404)', async () => {
      // given
      const headers = await fetchHeaders(req);
      const withHeaders = withHeadersBy(headers);

      const params: ParticipantTokenDto = {
        documentId,
        email: 'participant@email.com',
      };

      // when
      const res = await withHeaders(req.post(`${apiPath}/token`))
        .send(params)
        .expect(404);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 참가자 정보를 찾을 수 없습니다. (404) #삭제 상태', async () => {
      // given
      const headers = await fetchHeaders(req);
      const withHeaders = withHeadersBy(headers);

      updateParticipantStatus(participant.id, 'DELETED');

      const params: ParticipantTokenDto = {
        documentId,
        email: participant.email,
      };

      // when
      const res = await withHeaders(req.post(`${apiPath}/token`))
        .send(params)
        .expect(404);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 인증이 필요합니다. (401) #중복 발급', async () => {
      // given
      const headers1 = await fetchParticipantTokenAndCookie();
      await fetchParticipantTokenAndCookie();

      const withHeaders = withHeadersBy(headers1);

      // when
      const res = await withHeaders(req.get(`${apiPath}/document`)).expect(401);

      // then
      expectResponseFailed(res);
    });
  });

  describe('참가자 문서 읽기 GET /api/participant/document', () => {
    it('성공 - 문서 조회 (200)', async () => {
      // given
      const headers = await fetchParticipantTokenAndCookie();
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(req.get(`${apiPath}/document`)).expect(200);

      // then
      expectResponseSucceed(res);

      const response = getResponseData(res);
      expect(response.document.id).toEqual(document.id);
      expect(response.document.title).toEqual(document.title);
      expect(response.document.content).toEqual(document.content);
      expect(response.document.status).toEqual(document.status);
    });

    it('실패 - 인증이 필요합니다. (401)', async () => {
      // given
      const headers = await fetchParticipantTokenAndCookie();
      const withHeaders = withHeadersBy(headers, { token: false });

      // when
      const res = await withHeaders(req.get(`${apiPath}/document`)).expect(401);

      // then
      expectResponseFailed(res);
    });

    it('실패 - CSRF 토큰이 유효하지 않습니다. (403)', async () => {
      // given
      const headers = await fetchParticipantTokenAndCookie();
      const withHeaders = withHeadersBy(headers, { csrfToken: false });

      // when
      const res = await withHeaders(req.get(`${apiPath}/document`)).expect(403);

      // then
      expectResponseFailed(res);
    });
  });

  describe('참가자 문서 서명 POST /api/participant/sign', () => {
    it('성공 - 문서 서명 (200)', async () => {
      // given
      const headers = await fetchParticipantTokenAndCookie();
      const withHeaders = withHeadersBy(headers);

      const params = {
        signature: 'sign',
      };

      // when
      const res = await withHeaders(req.post(`${apiPath}/sign`))
        .send(params)
        .expect(200);

      // then
      expectResponseSucceed(res);

      const stored = participantRepository.findById(participant.id);
      expect(stored.status).toEqual('SIGNED');
      expect(stored.signature).toEqual(params.signature);
    });

    it('실패 - 서명은 필수입니다. (400)', async () => {
      // given
      const headers = await fetchParticipantTokenAndCookie();
      const withHeaders = withHeadersBy(headers);

      const params = {
        signature: '',
      };

      // when
      const res = await withHeaders(req.post(`${apiPath}/sign`))
        .send(params)
        .expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 이미 서명한 문서입니다. (400)', async () => {
      // given
      const headers = await fetchParticipantTokenAndCookie();
      const withHeaders = withHeadersBy(headers);

      updateParticipantStatus(participant.id, 'SIGNED');

      const params = {
        signature: 'sign',
      };

      // when
      const res = await withHeaders(req.post(`${apiPath}/sign`))
        .send(params)
        .expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 인증이 필요합니다. (401)', async () => {
      // given
      const headers = await fetchParticipantTokenAndCookie();
      const withHeaders = withHeadersBy(headers, { token: false });

      const params = {
        signature: 'sign',
      };

      // when
      const res = await withHeaders(req.post(`${apiPath}/sign`))
        .send(params)
        .expect(401);

      // then
      expectResponseFailed(res);
    });

    it('실패 - CSRF 토큰이 유효하지 않습니다. (403)', async () => {
      // given
      const headers = await fetchParticipantTokenAndCookie();
      const withHeaders = withHeadersBy(headers, { csrfToken: false });

      const params = {
        signature: 'sign',
      };

      // when
      const res = await withHeaders(req.post(`${apiPath}/sign`))
        .send(params)
        .expect(403);

      // then
      expectResponseFailed(res);
    });
  });
});
