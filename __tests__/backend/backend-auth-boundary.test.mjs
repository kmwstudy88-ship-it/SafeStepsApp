import { afterEach, expect, test } from '@jest/globals';

import { requireAuthenticatedUser } from '../../backend/middleware/requireAuthenticatedUser.js';

const originalBypass = process.env.SAFESTEPS_ALLOW_UNAUTHENTICATED_LOCAL_API;

afterEach(() => {
  if (originalBypass === undefined) {
    delete process.env.SAFESTEPS_ALLOW_UNAUTHENTICATED_LOCAL_API;
  } else {
    process.env.SAFESTEPS_ALLOW_UNAUTHENTICATED_LOCAL_API = originalBypass;
  }
});

function invokeMiddleware(headers = {}) {
  return new Promise((resolve) => {
    const req = { headers };
    requireAuthenticatedUser(req, {}, (error) => resolve({ error, req }));
  });
}

test('rejects protected backend requests without a bearer token', async () => {
  delete process.env.SAFESTEPS_ALLOW_UNAUTHENTICATED_LOCAL_API;

  const { error } = await invokeMiddleware();

  expect(error).toBeInstanceOf(Error);
  expect(error.statusCode).toBe(401);
  expect(error.message).toContain('Authentication required');
});

test('allows the explicit local-only smoke-test bypass', async () => {
  process.env.SAFESTEPS_ALLOW_UNAUTHENTICATED_LOCAL_API = 'true';

  const { error, req } = await invokeMiddleware();

  expect(error).toBeUndefined();
  expect(req.safeStepsUser).toBeNull();
});
