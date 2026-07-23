import { describe, expect, it, vi } from "vitest";

vi.mock("@/libs/product-events", () => ({
  recordProductEvent: vi.fn().mockResolvedValue(true),
}));

import { authOptions } from "@/app/auth";

describe("NextAuth administrator claims", () => {
  it("does not merge client-controlled session updates into the JWT", async () => {
    const callback = authOptions.callbacks?.jwt;
    expect(callback).toBeTypeOf("function");

    const token = await callback!({
      token: { id: "user-id", admin: false },
      user: undefined,
      account: null,
      profile: undefined,
      trigger: "update",
      session: { user: { id: "user-id", admin: true } },
      isNewUser: false,
    } as never);

    expect(token.admin).toBe(false);
  });

  it("writes a server-derived admin claim into JWT and session", async () => {
    const jwt = await authOptions.callbacks!.jwt!({
      token: {},
      user: { id: "admin-id", admin: true },
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
    } as never);
    const session = await authOptions.callbacks!.session!({
      session: {
        user: { name: "admin", email: null, image: null },
        expires: new Date(Date.now() + 60_000).toISOString(),
      },
      token: jwt,
      user: { id: "admin-id" },
      newSession: undefined,
      trigger: "update",
    } as never);

    expect(jwt).toMatchObject({ id: "admin-id", admin: true });
    expect(session.user).toMatchObject({ id: "admin-id", admin: true });
  });
});
