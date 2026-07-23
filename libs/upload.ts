import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  hasExpectedImageSignature,
  type ImageMimeType,
  MAX_UPLOAD_BODY_BYTES,
  MAX_UPLOAD_BYTES,
  RequestInputError,
} from "@/libs/request-validation";

const extensionByMimeType: Record<ImageMimeType, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

export function validateUploadRequest(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("multipart/form-data;")) {
    throw new RequestInputError(
      "Content-Type must be multipart/form-data",
      415,
      "UNSUPPORTED_MEDIA_TYPE",
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isFinite(contentLength) || contentLength <= 0) {
    throw new RequestInputError(
      "Content-Length is required",
      411,
      "LENGTH_REQUIRED",
    );
  }

  if (contentLength > MAX_UPLOAD_BODY_BYTES) {
    throw new RequestInputError(
      "Upload is too large",
      413,
      "PAYLOAD_TOO_LARGE",
    );
  }
}

export async function saveUploadedImage(formData: FormData) {
  const value = formData.get("file");
  if (!(value instanceof File)) {
    throw new RequestInputError("Image file is required", 400, "INVALID_FILE");
  }

  if (
    value.size <= 0 ||
    value.size > MAX_UPLOAD_BYTES ||
    !(value.type in extensionByMimeType)
  ) {
    throw new RequestInputError(
      "Invalid image file",
      value.size > MAX_UPLOAD_BYTES ? 413 : 400,
      value.size > MAX_UPLOAD_BYTES ? "PAYLOAD_TOO_LARGE" : "INVALID_FILE",
    );
  }

  const mimeType = value.type as ImageMimeType;
  const bytes = new Uint8Array(await value.arrayBuffer());
  if (!hasExpectedImageSignature(bytes, mimeType)) {
    throw new RequestInputError("Invalid image file", 400, "INVALID_FILE");
  }

  const dateDirectory = new Date().toISOString().slice(0, 10);
  const publicUploadRoot = path.resolve(process.cwd(), "public", "uploads");
  const uploadDirectory = path.resolve(publicUploadRoot, dateDirectory);
  if (
    uploadDirectory !== publicUploadRoot &&
    !uploadDirectory.startsWith(`${publicUploadRoot}${path.sep}`)
  ) {
    throw new RequestInputError("Invalid upload path", 400, "INVALID_PATH");
  }

  await mkdir(uploadDirectory, { recursive: true });
  const fileName = `${randomUUID()}${extensionByMimeType[mimeType]}`;
  await writeFile(path.join(uploadDirectory, fileName), bytes, { flag: "wx" });

  return `/uploads/${dateDirectory}/${fileName}`;
}
