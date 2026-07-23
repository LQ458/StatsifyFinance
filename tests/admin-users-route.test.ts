import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  connect: vi.fn(),
  find: vi.fn(),
  countDocuments: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: mocks.getServerSession,
}));
vi.mock("@/app/auth", () => ({
  authOptions: {},
}));
vi.mock("@/libs/mongodb", () => ({
  DBconnect: mocks.connect,
}));
vi.mock("@/models/user", () => ({
  default: {
    find: mocks.find,
    countDocuments: mocks.countDocuments,
  },
}));

import { SAFE_USER_PROJECTION } from "@/libs/safe-user";
import { GET } from "@/app/api/admin/users/route";

function request() {
  return new NextRequest("http://localhost/api/admin/users?page=1&per=10");
}

describe("administrator user listing", () => {
  beforeEach(() => {
    mocks.connect.mockResolvedValue(undefined);
    mocks.countDocuments.mockResolvedValue(1);
  });

  it("returns 401 without a session and performs no query", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    const response = await GET(request());

    expect(response.status).toBe(401);
    expect(mocks.find).not.toHaveBeenCalled();
  });

  it("returns 403 for a signed-in non-administrator", async () => {
    mocks.getServerSession.mockResolvedValue({
      user: { id: "user-id", admin: false },
    });

    const response = await GET(request());

    expect(response.status).toBe(403);
    expect(mocks.find).not.toHaveBeenCalled();
  });

  it("uses an allowlist projection and strips credential fields", async () => {
    mocks.getServerSession.mockResolvedValue({
      user: { id: "admin-id", admin: true },
    });

    const query = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: "user-id",
          username: "safe-user",
          admin: false,
          email: "safe@example.com",
          password: "hash",
          originalPassword: "plaintext",
          accessToken: "token",
        },
      ]),
    };
    mocks.find.mockReturnValue(query);

    const response = await GET(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.find).toHaveBeenCalledWith({}, SAFE_USER_PROJECTION);
    expect(JSON.stringify(body.data.list)).not.toMatch(
      /password|credential|token/i,
    );
  });
});
