import request from 'supertest';
import { LoginDto, LoginResponse } from '../../src/api/users/dto/login.dto';
import { User } from '../../src/api/users/entities/user.entity';
import { verify } from '../../src/lib/jwt';
import { createUser, mockUserRaw } from '../lib/mockup';
import {
  expectResponseFailed,
  expectResponseSucceed,
  fetchHeaders,
  fetchUserTokenAndHeaders,
  getResponseData,
  getServer,
  isApiResponse,
  withHeadersBy,
} from '../lib/utils';

describe('UserController (e2e)', () => {
  const app = getServer();
  const req = request(app);

  const rootApiPath = '/api/users';

  describe('로그인: POST /api/users/login', () => {
    const apiPath = `${rootApiPath}/login`;

    it('성공 - 로그인 (200)', async () => {
      // given
      const headers = await fetchHeaders(req);
      const withHeaders = withHeadersBy(headers);

      const userRaw = mockUserRaw();
      createUser(userRaw);

      const params: LoginDto = {
        email: userRaw.email,
        password: userRaw.password,
      };

      // when
      const res = await withHeaders(req.post(apiPath)).send(params).expect(200);

      // then
      expect(isApiResponse(res.body)).toBe(true);
      expectResponseSucceed(res);

      const result = getResponseData(res) as LoginResponse;
      expect(result.token).toBeTruthy();

      const decoded = verify(result.token);
      expect(decoded).toHaveProperty('user_id', userRaw.id);
      expect(decoded).toHaveProperty('email', userRaw.email);

      expect(result.user).toEqual(User.fromJson(userRaw).toJson());
    });

    it('실패 - 이메일은 필수입니다. (400)', async () => {
      // given
      const headers = await fetchHeaders(req);
      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(req.post(apiPath)).expect(400);

      // then
      expect(isApiResponse(res.body)).toBe(true);
      expectResponseFailed(res);
    });

    it('실패 - 인증이 필요합니다. (401) #중복 로그인', async () => {
      // given
      const userRaw = mockUserRaw();
      const headers = await fetchUserTokenAndHeaders(req, userRaw);
      const withHeaders = withHeadersBy(headers);

      await fetchUserTokenAndHeaders(req, userRaw);

      // when
      const res = await withHeaders(req.get(`${rootApiPath}/me`)).expect(401);

      // then
      expectResponseFailed(res);
    });
  });

  describe('내 정보 조회: GET /api/users/me', () => {
    const apiPath = `${rootApiPath}/me`;

    it('실패 - 인증이 필요합니다. (401)', async () => {
      // given
      const headers = await fetchUserTokenAndHeaders(req);
      const withHeaders = withHeadersBy(headers, { token: false });

      // when
      const res = await withHeaders(req.get(apiPath)).expect(401);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 인증이 필요합니다. (401) #쿠키 없이 요청', async () => {
      // given
      const headers = await fetchUserTokenAndHeaders(req);
      const withHeaders = withHeadersBy(headers, { cookie: false });

      // when
      const res = await withHeaders(req.get(apiPath)).expect(401);

      // then
      expectResponseFailed(res);
    });

    it('실패 - 인증 정보와 세션 정보가 다릅니다. (403)', async () => {
      // given
      const headers1 = await fetchUserTokenAndHeaders(req);
      const headers2 = await fetchUserTokenAndHeaders(req);
      headers1.cookie = headers2.cookie;
      const withHeaders = withHeadersBy(headers1);

      // when
      const res = await withHeaders(req.get(apiPath)).expect(403);

      // then
      expectResponseFailed(res);
    });

    it('실패 - CSRF 토큰이 유효하지 않습니다. (403) #empty header', async () => {
      // given
      const headers = await fetchUserTokenAndHeaders(req);
      const withHeaders = withHeadersBy(headers, { csrfToken: false });

      // when
      const res = await withHeaders(req.get(apiPath)).expect(403);

      // then
      expectResponseFailed(res);
    });

    it('실패 - CSRF 토큰이 유효하지 않습니다. (403) #invalid csrf token', async () => {
      // given
      const headers = await fetchUserTokenAndHeaders(req);
      headers.csrfToken = 'invalid csrf token';

      const withHeaders = withHeadersBy(headers);

      // when
      const res = await withHeaders(req.get(apiPath)).expect(403);

      // then
      expectResponseFailed(res);
    });
  });
});
