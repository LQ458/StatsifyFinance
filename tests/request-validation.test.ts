import { describe, expect, it } from "vitest";
import {
  chatRequestSchema,
  MAX_CHAT_BODY_BYTES,
  MAX_IMAGE_BYTES,
  parseImageAnalysisRequest,
  readJsonBody,
  RequestInputError,
  textAnalysisRequestSchema,
} from "@/libs/request-validation";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("request input limits", () => {
  it("bounds chat and text prompts", () => {
    expect(
      chatRequestSchema.safeParse({
        message: "a".repeat(1000),
        locale: "en",
      }).success,
    ).toBe(true);
    expect(
      chatRequestSchema.safeParse({
        message: "a".repeat(1001),
        locale: "en",
      }).success,
    ).toBe(false);
    expect(
      textAnalysisRequestSchema.safeParse({
        text: "a".repeat(12_000),
        question: "Explain",
        locale: "en",
      }).success,
    ).toBe(true);
    expect(
      textAnalysisRequestSchema.safeParse({
        text: "a".repeat(12_001),
        question: "Explain",
        locale: "en",
      }).success,
    ).toBe(false);
  });

  it("rejects oversized JSON bodies before parsing", async () => {
    const request = jsonRequest({ message: "a".repeat(MAX_CHAT_BODY_BYTES) });
    await expect(
      readJsonBody(request, MAX_CHAT_BODY_BYTES),
    ).rejects.toMatchObject({
      status: 413,
      code: "PAYLOAD_TOO_LARGE",
    });
  });

  it("accepts allowed image signatures and rejects forged formats", () => {
    const pngSignature = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]).toString("base64");

    expect(
      parseImageAnalysisRequest({
        image: `data:image/png;base64,${pngSignature}`,
        question: "Analyze",
        locale: "en",
      }).mimeType,
    ).toBe("image/png");

    expect(() =>
      parseImageAnalysisRequest({
        image: `data:image/jpeg;base64,${pngSignature}`,
        question: "Analyze",
        locale: "en",
      }),
    ).toThrow(RequestInputError);
    expect(() =>
      parseImageAnalysisRequest({
        image: `data:image/gif;base64,${pngSignature}`,
        question: "Analyze",
        locale: "en",
      }),
    ).toThrow(RequestInputError);
  });

  it("rejects decoded images above the byte limit", () => {
    const bytes = Buffer.alloc(MAX_IMAGE_BYTES + 1);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    expect(() =>
      parseImageAnalysisRequest({
        image: `data:image/png;base64,${bytes.toString("base64")}`,
        question: "Analyze",
        locale: "en",
      }),
    ).toThrow(
      expect.objectContaining({
        status: 413,
        code: "PAYLOAD_TOO_LARGE",
      }),
    );
  });
});
