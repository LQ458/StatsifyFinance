import { describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import { POST as analyzeImage } from "@/app/api/analyze-image/route";
import { POST as analyzeText } from "@/app/api/analyze-text/route";
import { POST as chat } from "@/app/api/chat/route";
import { POST as suggestTopics } from "@/app/api/suggest-topics/route";

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("public API contracts", () => {
  it("rejects chat messages over the prompt limit before upstream work", async () => {
    const response = await chat(
      jsonRequest("/api/chat", {
        message: "a".repeat(1001),
        locale: "en",
      }) as never,
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects text analysis over the prompt limit", async () => {
    const response = await analyzeText(
      jsonRequest("/api/analyze-text", {
        text: "a".repeat(12_001),
        question: "Explain",
        locale: "en",
      }) as never,
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects forged image data", async () => {
    const response = await analyzeImage(
      jsonRequest("/api/analyze-image", {
        image: `data:image/png;base64,${Buffer.from("not-an-image").toString("base64")}`,
        question: "Analyze",
        locale: "en",
      }) as never,
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves the topic suggestion response contract", async () => {
    const response = await suggestTopics(
      jsonRequest("/api/suggest-topics", {
        pageType: "quantitative",
        locale: "zh",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: [{ title: expect.any(String) }],
    });
  });
});
