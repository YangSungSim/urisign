import request from 'supertest';
import {
  genUUID,
  mockCreateDocumentDto,
  updateDocumentStatus,
} from '../lib/mockup';
import {
  createDocument,
  expectResponseFailed,
  expectResponseSucceed,
  fetchDocument,
  fetchUserTokenAndHeaders,
  getResponseData,
  getServer,
  Headers,
  updateCsrfToken,
  withHeadersBy,
} from '../lib/utils';

describe('DocumentController (e2e)', () => {
  const app = getServer();
  const req = request(app);

  const rootApiPath = '/api/documents';

  let headers: Headers;

  beforeEach(async () => {
    headers = await fetchUserTokenAndHeaders(req);
  });

  async function removeDocument(id: string) {
    const withHeaders = withHeadersBy(headers);
    const res = await withHeaders(req.delete(`${rootApiPath}/${id}`)).expect(
      200,
    );

    updateCsrfToken(res, headers);

    return getResponseData(res) as boolean;
  }

  describe('문서 생성 POST /api/documents', () => {
    const apiPath = `${rootApiPath}`;

    it('성공 - 문서 생성 (200)', async () => {
      // given
      const withHeaders = withHeadersBy(headers);
      const participantCount = 2;
      const params = mockCreateDocumentDto(participantCount);

      // when
      const res = await withHeaders(req.post(apiPath)).send(params).expect(200);

      // then
      expectResponseSucceed(res);

      updateCsrfToken(res, headers);

      const { documentId } = getResponseData(res);
      const document = await fetchDocument(req, headers, documentId);

      expect(document.title).toEqual(params.title);
      expect(document.content).toEqual(params.content);
      expect(document.status).toEqual('CREATED');

      document.participants.forEach((participant) => {
        const param = params.participants.find(
          (p) => p.name === participant.name,
        );
        expect(param).not.toBeUndefined();
        expect(participant.email).toEqual(param.email);
        expect(participant.status).toEqual('CREATED');
      });
    });

    it('실패 - 제목은 필수입니다. (400)', async () => {
      // given
      const withHeaders = withHeadersBy(headers);
      const params = mockCreateDocumentDto();
      params.title = '';

      // when
      const res = await withHeaders(req.post(apiPath)).send(params).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 내용은 필수입니다. (400)', async () => {
      // given
      const withHeaders = withHeadersBy(headers);
      const params = mockCreateDocumentDto();
      params.content = '';

      // when
      const res = await withHeaders(req.post(apiPath)).send(params).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 참가자의 이름은 필수입니다. (400)', async () => {
      // given
      const withHeaders = withHeadersBy(headers);
      const params = mockCreateDocumentDto();
      params.participants[0].name = '';

      // when
      const res = await withHeaders(req.post(apiPath)).send(params).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 참가자의 이메일은 필수입니다. (400)', async () => {
      // given
      const withHeaders = withHeadersBy(headers);
      const params = mockCreateDocumentDto();
      params.participants[0].email = '';

      // when
      const res = await withHeaders(req.post(apiPath)).send(params).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 참가자의 이메일이 형식에 맞지 않습니다. (400)', async () => {
      // given
      const withHeaders = withHeadersBy(headers);
      const params = mockCreateDocumentDto();
      params.participants[0].email = 'invalid email format';

      // when
      const res = await withHeaders(req.post(apiPath)).send(params).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 참가자의 이메일이 중복 되었습니다. (400)', async () => {
      // given
      const withHeaders = withHeadersBy(headers);
      const params = mockCreateDocumentDto();
      params.participants[1].email = params.participants[0].email;

      // when
      const res = await withHeaders(req.post(apiPath)).send(params).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 참가자는 최소 2명에서 최대 10명까지 가능합니다. (400) #참가자 1명', async () => {
      // given
      const withHeaders = withHeadersBy(headers);
      const params = mockCreateDocumentDto(1);

      // when
      const res = await withHeaders(req.post(apiPath)).send(params).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 참가자는 최소 2명에서 최대 10명까지 가능합니다. (400) #참가자 11명', async () => {
      // given
      const withHeaders = withHeadersBy(headers);
      const params = mockCreateDocumentDto(11);

      // when
      const res = await withHeaders(req.post(apiPath)).send(params).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 인증이 필요합니다. (401)', async () => {
      // given
      const withHeaders = withHeadersBy(headers, { token: false });

      // when
      const res = await withHeaders(req.post(apiPath)).expect(401);

      // then
      expectResponseFailed(res);
    });

    it('실패 - CSRF 토큰이 유효하지 않습니다. (403)', async () => {
      // given
      const withHeaders = withHeadersBy(headers, { csrfToken: false });

      // when
      const res = await withHeaders(req.post(apiPath)).expect(403);

      // then
      expectResponseFailed(res);
    });
  });

  describe('문서 조회 GET /api/documents/{documentId}', () => {
    const apiPath = `${rootApiPath}`;

    it('성공 - 문서 조회 (200)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(req.get(`${apiPath}/${documentId}`)).expect(
        200,
      );

      // then
      expectResponseSucceed(res);

      const document = getResponseData(res).document;
      expect(document.status).toEqual('CREATED');
    });

    it('실패 - 인증이 필요합니다. (401)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers, { token: false });

      // when
      const res = await withHeaders(req.get(`${apiPath}/${documentId}`)).expect(
        401,
      );

      // then
      expectResponseFailed(res);
    });

    it('실패 - CSRF 토큰이 유효하지 않습니다. (403)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers, { csrfToken: false });

      // when
      const res = await withHeaders(req.get(`${apiPath}/${documentId}`)).expect(
        403,
      );

      // then
      expectResponseFailed(res);
    });

    it('실패 - 문서의 소유자가 아닙니다. (403)', async () => {
      // given
      const otherUserHeaders = await fetchUserTokenAndHeaders(req);
      const documentId = await createDocument(req, otherUserHeaders);
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(req.get(`${apiPath}/${documentId}`)).expect(
        403,
      );

      // then
      expectResponseFailed(res);
    });

    it('실패 - 문서를 찾을 수 없습니다. (404)', async () => {
      // given
      const documentId = genUUID();
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(req.get(`${apiPath}/${documentId}`)).expect(
        404,
      );

      // then
      expectResponseFailed(res);
    });

    it('실패 - 문서 ID가 올바르지 않습니다. (404)', async () => {
      // given
      const documentId = 'not-found-document-id';
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(req.get(`${apiPath}/${documentId}`)).expect(
        404,
      );

      // then
      expectResponseFailed(res);
    });
  });

  describe('문서 삭제 DELETE /api/documents/{documentId}', () => {
    const apiPath = `${rootApiPath}`;

    it('성공 - 문서 삭제 (200)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(
        req.delete(`${apiPath}/${documentId}`),
      ).expect(200);

      // then
      expectResponseSucceed(res);

      updateCsrfToken(res, headers);

      const document = await fetchDocument(req, headers, documentId);
      expect(document.status).toEqual('DELETED');
      document.participants.forEach((participant) => {
        expect(participant.status).toEqual('DELETED');
      });
    });

    it('성공 - 문서 삭제 (200) #삭제 상태', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers);

      updateDocumentStatus(documentId, 'DELETED');

      // when
      const res = await withHeaders(
        req.delete(`${apiPath}/${documentId}`),
      ).expect(200);

      // then
      expectResponseSucceed(res);

      updateCsrfToken(res, headers);

      const document = await fetchDocument(req, headers, documentId);
      expect(document.status).toEqual('DELETED');
    });

    it('실패 - 문서를 삭제 할 수 없는 상태입니다. (400)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers);

      updateDocumentStatus(documentId, 'PUBLISHED');

      // when
      const res = await withHeaders(
        req.delete(`${apiPath}/${documentId}`),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 인증이 필요합니다. (401)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers, { token: false });

      // when
      const res = await withHeaders(
        req.delete(`${apiPath}/${documentId}`),
      ).expect(401);

      // then
      expectResponseFailed(res);
    });

    it('실패 - CSRF 토큰이 유효하지 않습니다. (403)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers, { csrfToken: false });

      // when
      const res = await withHeaders(
        req.delete(`${apiPath}/${documentId}`),
      ).expect(403);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 문서의 소유자가 아닙니다. (403)', async () => {
      // given
      const otherUserHeaders = await fetchUserTokenAndHeaders(req);
      const documentId = await createDocument(req, otherUserHeaders);
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(
        req.delete(`${apiPath}/${documentId}`),
      ).expect(403);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 문서를 찾을 수 없습니다. (404)', async () => {
      // given
      const documentId = genUUID();
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(
        req.delete(`${apiPath}/${documentId}`),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 문서 ID가 올바르지 않습니다. (404)', async () => {
      // given
      const documentId = 'not-found-document-id';
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(
        req.delete(`${apiPath}/${documentId}`),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });

  describe('문서 발행 POST /api/documents/{documentId}/publish', () => {
    const apiPath = `${rootApiPath}`;

    it('성공 - 문서 발행 (200)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(
        req.post(`${apiPath}/${documentId}/publish`),
      ).expect(200);

      // then
      expectResponseSucceed(res);

      updateCsrfToken(res, headers);

      const document = await fetchDocument(req, headers, documentId);
      expect(document.status).toEqual('PUBLISHED');
      document.participants.forEach((participant) => {
        expect(participant.status).toEqual('INVITED');
      });
    });

    it('실패 - 문서를 발행 할 수 없는 상태입니다. (400)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      updateDocumentStatus(documentId, 'DELETED');
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(
        req.post(`${apiPath}/${documentId}/publish`),
      ).expect(400);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 인증이 필요합니다. (401)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers, { token: false });

      // when
      const res = await withHeaders(
        req.post(`${apiPath}/${documentId}/publish`),
      ).expect(401);

      // then
      expectResponseFailed(res);
    });

    it('실패 - CSRF 토큰이 유효하지 않습니다. (403)', async () => {
      // given
      const documentId = await createDocument(req, headers);
      const withHeaders = withHeadersBy(headers, { csrfToken: false });

      // when
      const res = await withHeaders(
        req.post(`${apiPath}/${documentId}/publish`),
      ).expect(403);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 문서의 소유자가 아닙니다. (403)', async () => {
      // given
      const otherUserHeaders = await fetchUserTokenAndHeaders(req);
      const documentId = await createDocument(req, otherUserHeaders);
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(
        req.post(`${apiPath}/${documentId}/publish`),
      ).expect(403);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 문서를 찾을 수 없습니다. (404)', async () => {
      // given
      const documentId = genUUID();
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(
        req.post(`${apiPath}/${documentId}/publish`),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 문서 ID가 올바르지 않습니다. (404)', async () => {
      // given
      const documentId = 'not-found-document-id';
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(
        req.post(`${apiPath}/${documentId}/publish`),
      ).expect(404);

      // then
      expectResponseFailed(res);
    });
  });

  describe('문서 목록 조회 GET /api/documents', () => {
    const apiPath = `${rootApiPath}`;

    it('성공 - 문서 조회 (200)', async () => {
      // given
      for (let i = 0; i < 10; i++) {
        await createDocument(req, headers);
      }
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(req.get(apiPath)).expect(200);

      // then
      expectResponseSucceed(res);

      const documents = getResponseData(res) as Document[];
      expect(documents).toHaveLength(5);
    });

    it('성공 - 문서 조회 (200) #offset&size', async () => {
      // given
      for (let i = 0; i < 3; i++) {
        await createDocument(req, headers);
      }
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(req.get(apiPath))
        .query({
          offset: 1,
          size: 1,
        })
        .expect(200);

      // then
      expectResponseSucceed(res);

      const documents = getResponseData(res) as Document[];
      expect(documents).toHaveLength(1);
    });

    it('성공 - 문서 조회 (200) #status', async () => {
      // given
      let documentId: string;
      for (let i = 0; i < 3; i++) {
        documentId = await createDocument(req, headers);
      }
      await removeDocument(documentId);
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(req.get(apiPath))
        .query({
          status: 'DELETED',
        })
        .expect(200);

      // then
      expectResponseSucceed(res);

      const documents = getResponseData(res);
      expect(documents).toHaveLength(1);
      expect(documents[0].id).toEqual(documentId);
    });

    it('실패 - 인증이 필요합니다. (401)', async () => {
      // given
      const withHeaders = withHeadersBy(headers, { token: false });

      // when
      const res = await withHeaders(req.get(apiPath)).expect(401);

      // then
      expectResponseFailed(res);
    });

    it('실패 - CSRF 토큰이 유효하지 않습니다. (403)', async () => {
      // given
      const withHeaders = withHeadersBy(headers, { csrfToken: false });

      // when
      const res = await withHeaders(req.get(apiPath)).expect(403);

      // then
      expectResponseFailed(res);
    });
  });
});
