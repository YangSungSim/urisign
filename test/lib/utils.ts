import request, { Response } from 'supertest';
import { UUID } from '../../src/@types/datatype';
import DocumentController from '../../src/api/documents/document.controller';
import ParticipantController from '../../src/api/participant/participant.controller';
import { LoginDto } from '../../src/api/users/dto/login.dto';
import { UserRaw } from '../../src/api/users/entities/user.entity';
import UserController from '../../src/api/users/user.controllers';
import App from '../../src/app';
import { CSRF_TOKEN_HEADER } from '../../src/middlewares/csrf.middleware';
import { createUser, mockCreateDocumentDto, mockUserRaw } from './mockup';

export interface Headers {
  cookie?: string;
  csrfToken?: string;
  token?: string;
}

export function getServer() {
  const app = new App([
    new UserController(),
    new ParticipantController(),
    new DocumentController(),
  ]);
  return app.getServer();
}

export function isApiResponse(body: Record<string, any>) {
  return typeof body.success === 'boolean';
}

export function expectResponseSucceed(res: Response) {
  const data = res.body;
  if (isApiResponse(data)) {
    expect(data.success).toBe(true);
    expect(data.response).not.toBeNull();
    expect(data.error).toBeNull();
  } else {
    expect(data).not.toBeNull();
  }
}

export function expectResponseFailed(res: Response) {
  const data = res.body;
  if (isApiResponse(data)) {
    expect(data.success).toBe(false);
    expect(data.response).toBeNull();
    expect(data.error).not.toBeNull();
  } else {
    expect(typeof data.status).toBe('number');
    expect(data.message).not.toBeNull();
  }
}

export function withHeadersBy(
  headers: Headers,
  options?: Partial<Record<keyof Headers, boolean>>,
) {
  return function withHeaders(req: request.Test) {
    return setHeaders(req, headers, options);
  };
}

export function getHeadersFrom(res: Response, headers: Headers = {}): Headers {
  const token = headers.token;
  const cookie = headers.cookie ?? res.header['set-cookie'][0];
  const csrfToken = res.header[CSRF_TOKEN_HEADER];

  return {
    token,
    cookie,
    csrfToken,
  };
}

export async function fetchHeaders(req: request.SuperTest<request.Test>) {
  const res = await req.get('/api').expect(200);

  return getHeadersFrom(res);
}

export function setHeaders(
  req: request.Test,
  headers: Headers,
  options: Partial<Record<keyof Headers, boolean>> = {},
) {
  if (
    headers.token &&
    !(typeof options.token !== 'undefined' && !options.token)
  ) {
    req.auth(headers.token, { type: 'bearer' });
  }

  if (
    headers.cookie &&
    !(typeof options.cookie !== 'undefined' && !options.cookie)
  ) {
    req.set('Cookie', headers.cookie);
  }

  if (
    headers.csrfToken &&
    !(typeof options.csrfToken !== 'undefined' && !options.csrfToken)
  ) {
    req.set(CSRF_TOKEN_HEADER, headers.csrfToken);
  }

  return req;
}

export function getResponseData(res: Response) {
  const body = res.body;

  if (isApiResponse(body)) {
    return body.response;
  } else {
    return body;
  }
}

export async function fetchUserTokenAndHeaders(
  req: request.SuperTest<request.Test>,
  userRaw: UserRaw = mockUserRaw(),
) {
  try {
    createUser(userRaw);
  } catch {}

  const headers = await fetchHeaders(req);
  const withHeaders = withHeadersBy(headers);

  const params: LoginDto = {
    email: userRaw.email,
    password: userRaw.password,
  };

  const res = await withHeaders(req.post('/api/users/login'))
    .send(params)
    .expect(200);

  const resData = getResponseData(res);
  const token = resData.token;
  const headersWithToken = getHeadersFrom(res, {
    ...headers,
    token,
  });
  return headersWithToken;
}

export function updateCsrfToken(res: Response, headers: Headers) {
  headers.csrfToken = res.header[CSRF_TOKEN_HEADER];
}

export async function createDocument(
  req: request.SuperTest<request.Test>,
  headers: Headers,
) {
  const params = mockCreateDocumentDto();
  const res = await setHeaders(req.post('/api/documents'), headers)
    .send(params)
    .expect(200);

  updateCsrfToken(res, headers);

  const resData = getResponseData(res);
  return resData.documentId as UUID;
}

export async function publishDocument(
  req: request.SuperTest<request.Test>,
  headers: Headers,
  documentId: UUID,
) {
  const params = mockCreateDocumentDto();
  const res = await setHeaders(
    req.post(`/api/documents/${documentId}/publish`),
    headers,
  )
    .send(params)
    .expect(200);

  updateCsrfToken(res, headers);

  const resData = getResponseData(res);
  return resData as boolean;
}

export async function fetchDocument(
  req: request.SuperTest<request.Test>,
  headers: Headers,
  documentId: UUID,
) {
  const res = await setHeaders(
    req.get(`/api/documents/${documentId}`),
    headers,
  ).expect(200);

  updateCsrfToken(res, headers);

  const resData = getResponseData(res);
  const document = resData.document;
  expect(document).not.toBeUndefined();
  return document;
}