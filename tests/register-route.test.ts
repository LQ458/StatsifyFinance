import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  create: vi.fn(),
  recordEvent: vi.fn(),
}));

vi.mock("@/libs/mongodb", () => ({
  DBconnect: mocks.connect,
}));
vi.mock("@/models/user", () => ({
  default: {
    create: mocks.create,
  },
}));
vi.mock("@/libs/product-events", () => ({
  recordProductEvent: mocks.recordEvent,
}));

import { POST } from "@/app/api/register/route";

describe("registration route", () => {
  beforeEach(() => {
    mocks.connect.mockResolvedValue(undefined);
    mocks.create.mockResolvedValue({ _id: "user-id" });
    mocks.recordEvent.mockResolvedValue(true);
  });

  it("stores only a bcrypt hash and returns no password fields", async () => {
    const request = new Request("http://localhost/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "User1234",
        password: "Secure1!",
        email: "USER@example.com",
      }),
    });

    const response = await POST(request as never);
    const body = await response.json();
    const saved = mocks.create.mock.calls[0][0];

    expect(response.status).toBe(201);
    expect(saved).not.toHaveProperty("originalPassword");
    expect(saved.password).not.toBe("Secure1!");
    expect(await bcrypt.compare("Secure1!", saved.password)).toBe(true);
    expect(JSON.stringify(body)).not.toMatch(/password/i);
    expect(body).toEqual({
      success: true,
      message: "用户创建成功",
    });
  });

  it("does not accept credentials in query parameters", async () => {
    const request = new Request(
      "http://localhost/api/register?username=User1234&password=Secure1!&email=user@example.com",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );

    const response = await POST(request as never);

    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
