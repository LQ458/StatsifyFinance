type BaiduTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

type BaiduOCRResponse = {
  words_result?: Array<{ words: string }>;
};

let cachedToken:
  | {
      value: string;
      expiresAt: number;
    }
  | undefined;

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const apiKey = process.env.BAIDU_API_KEY;
  const secretKey = process.env.BAIDU_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error("Baidu OCR is not configured");
  }

  const response = await fetch("https://aip.baidubce.com/oauth/2.0/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: apiKey,
      client_secret: secretKey,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error("Baidu OCR authorization failed");
  }

  const body = (await response.json()) as BaiduTokenResponse;
  if (!body.access_token) {
    throw new Error("Baidu OCR authorization failed");
  }

  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + Math.max(60, body.expires_in ?? 2_592_000) * 1000,
  };
  return cachedToken.value;
}

export async function recognizeImageText(base64: string) {
  const accessToken = await getAccessToken();
  const endpoint = new URL(
    "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic",
  );
  endpoint.searchParams.set("access_token", accessToken);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      image: base64,
      language_type: "CHN_ENG",
      detect_direction: "true",
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error("Baidu OCR request failed");
  }

  const body = (await response.json()) as BaiduOCRResponse;
  if (!Array.isArray(body.words_result)) {
    throw new Error("Baidu OCR request failed");
  }

  return body.words_result;
}
