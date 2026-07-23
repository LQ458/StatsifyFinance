import { z } from "zod";

export const MAX_CHAT_BODY_BYTES = 16 * 1024;
export const MAX_TEXT_BODY_BYTES = 64 * 1024;
export const MAX_IMAGE_BODY_BYTES = 4 * 1024 * 1024 + 64 * 1024;
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_UPLOAD_BODY_BYTES = 3 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export class RequestInputError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
    this.name = "RequestInputError";
  }
}

export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<unknown> {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();

  if (mediaType !== "application/json") {
    throw new RequestInputError(
      "Content-Type must be application/json",
      415,
      "UNSUPPORTED_MEDIA_TYPE",
    );
  }

  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isFinite(contentLength) || contentLength < 0) {
      throw new RequestInputError(
        "Invalid Content-Length",
        400,
        "INVALID_CONTENT_LENGTH",
      );
    }
    if (contentLength > maxBytes) {
      throw new RequestInputError(
        "Request body is too large",
        413,
        "PAYLOAD_TOO_LARGE",
      );
    }
  }

  if (!request.body) {
    throw new RequestInputError(
      "Request body is required",
      400,
      "INVALID_JSON",
    );
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new RequestInputError(
        "Request body is too large",
        413,
        "PAYLOAD_TOO_LARGE",
      );
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
  } catch {
    throw new RequestInputError("Invalid JSON body", 400, "INVALID_JSON");
  }
}

export const registrationSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z][a-zA-Z0-9]{3,17}$/),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
    ),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  locale: z.enum(["zh", "en"]),
  conversationId: z
    .string()
    .max(64)
    .regex(/^[a-zA-Z0-9-]+$/)
    .nullable()
    .optional(),
});

export const textAnalysisRequestSchema = z.object({
  text: z.string().trim().min(1).max(12_000),
  question: z.string().trim().min(1).max(1000),
  locale: z.enum(["zh", "en"]).default("zh"),
});

const imageAnalysisRequestSchema = z.object({
  image: z
    .string()
    .min(1)
    .max(Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 64),
  question: z.string().trim().min(1).max(1000),
  locale: z.enum(["zh", "en"]).default("zh"),
});

export type ImageMimeType = "image/png" | "image/jpeg" | "image/webp";

export function hasExpectedImageSignature(
  bytes: Uint8Array,
  mimeType: ImageMimeType,
): boolean {
  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((byte, index) => bytes[index] === byte);
  }

  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

export function parseImageAnalysisRequest(input: unknown) {
  const parsed = imageAnalysisRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new RequestInputError(
      "Invalid image analysis request",
      400,
      "INVALID_INPUT",
    );
  }

  const dataUrlMatch =
    /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
      parsed.data.image,
    );
  if (!dataUrlMatch || dataUrlMatch[2].length % 4 !== 0) {
    throw new RequestInputError("Invalid image data", 400, "INVALID_IMAGE");
  }

  const mimeType = `image/${dataUrlMatch[1]}` as ImageMimeType;
  const base64 = dataUrlMatch[2];
  const bytes = Uint8Array.from(Buffer.from(base64, "base64"));

  if (
    bytes.byteLength === 0 ||
    bytes.byteLength > MAX_IMAGE_BYTES ||
    !hasExpectedImageSignature(bytes, mimeType)
  ) {
    throw new RequestInputError(
      "Invalid image data",
      bytes.byteLength > MAX_IMAGE_BYTES ? 413 : 400,
      bytes.byteLength > MAX_IMAGE_BYTES
        ? "PAYLOAD_TOO_LARGE"
        : "INVALID_IMAGE",
    );
  }

  return {
    question: parsed.data.question,
    locale: parsed.data.locale,
    base64,
    mimeType,
  };
}

export function jsonInputError(error: RequestInputError) {
  return Response.json(
    {
      success: false,
      error: error.message,
      code: error.code,
    },
    { status: error.status },
  );
}
