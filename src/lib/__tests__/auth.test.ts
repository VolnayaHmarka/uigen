// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

vi.mock("server-only", () => ({}));

const mockGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockGet })),
}));

import { getSession } from "@/lib/auth";

const TEST_SECRET = new TextEncoder().encode("development-secret-key");

async function makeToken(
  payload: object,
  expiresIn: string = "7d",
  secret = TEST_SECRET
) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(secret);
}

beforeEach(() => {
  vi.clearAllMocks();
});

test("returns null when no cookie is present", async () => {
  mockGet.mockReturnValue(undefined);

  const session = await getSession();

  expect(session).toBeNull();
});

test("returns session payload for a valid token", async () => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await makeToken({
    userId: "user-123",
    email: "test@example.com",
    expiresAt,
  });
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session).not.toBeNull();
  expect(session?.userId).toBe("user-123");
  expect(session?.email).toBe("test@example.com");
});

test("returns null for an expired token", async () => {
  const token = await makeToken(
    { userId: "user-123", email: "test@example.com" },
    "-1s"
  );
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session).toBeNull();
});

test("returns null for a malformed token string", async () => {
  mockGet.mockReturnValue({ value: "not.a.valid.jwt" });

  const session = await getSession();

  expect(session).toBeNull();
});

test("returns null for a token signed with a different secret", async () => {
  const wrongSecret = new TextEncoder().encode("wrong-secret");
  const token = await makeToken(
    { userId: "user-123", email: "test@example.com" },
    "7d",
    wrongSecret
  );
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session).toBeNull();
});

test("reads the auth-token cookie by name", async () => {
  mockGet.mockReturnValue(undefined);

  await getSession();

  expect(mockGet).toHaveBeenCalledWith("auth-token");
});
