import * as z from 'zod/v4-mini';
import { defineApiRoute } from '../../types/index.js';
import {
  sessionSchema
} from '../../schema/index.js';

export const authRoutes = {
  session: defineApiRoute({
    response: z.catch(z.nullable(sessionSchema), null),
    path: `/auth/session`,
    method: 'GET',
  }),
  app: {
    loginUri: defineApiRoute({
      response: z.object({ loginUrl: z.url(), loginId: z.string() }),
      path: `/auth/app/login-uri`,
      method: 'GET',
    }),
    loginToken: defineApiRoute({
      path: `/auth/app/login-token`,
      method: 'GET',
      query: z.object({ loginId: z.string() }),
      response: z.object({
        refreshToken: z.string(),
        accessToken: z.string(),
      }),
    }),
    login: defineApiRoute({
      path: `/auth/app/login`,
      method: 'POST',
      body: z.object({
        loginId: z.string(),
      }),
    }),
    logout: defineApiRoute({
      path: `/auth/app/logout`,
      method: 'POST',
      body: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
      }),
    }),
    refresh: defineApiRoute({
      body: z.object({
        refreshToken: z.string(),
      }),
      path: `/auth/app/refresh`,
      method: 'POST',
      response: z.object({
        refreshToken: z.string(),
        accessToken: z.string(),
      }),
    }),
  },
} as const;
