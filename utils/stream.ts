import { ReadableStream } from "stream/web";

// 超时处理函数
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string,
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms: ${errorMessage}`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    throw error;
  }
}

// 处理多余空行的函数
function normalizeText(text: string): string {
  return text
    .replace(/\n{3,}/g, "\n\n") // 将3个及以上连续换行替换为2个
    .replace(/\n\s+\n/g, "\n\n") // 删除空行中的空格
    .replace(/([：:])\n{2,}/g, "$1\n") // 标题后的多个换行替换为单个换行
    .replace(/\n{2,}([•\-\d])/g, "\n$1"); // 列表项前的多个换行替换为单个换行
}

// 处理流式响应
export async function streamText(
  response: Response,
  headers: Headers,
): Promise<Response> {
  try {
    if (!response.ok) {
      console.error(`[Stream] HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available");
    }

    // 创建新的流
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // 发送完成标记
              controller.enqueue(new TextEncoder().encode("d:[DONE]\n"));
              controller.close();
              break;
            }

            // 处理数据块
            const text = new TextDecoder().decode(value);
            const lines = text.split("\n").filter(Boolean);

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(new TextEncoder().encode("e:[DONE]\n"));
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    const content = parsed.choices[0].delta.content;
                    // 对内容进行格式化处理
                    const normalizedContent = normalizeText(content);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `0:${JSON.stringify(normalizedContent)}\n`,
                      ),
                    );
                  }
                } catch (e) {
                  console.error("Error parsing JSON:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream processing error:", error);
          controller.error(error);
        }
      },

      cancel() {
        reader.cancel();
      },
    });

    return new Response(stream as any, {
      headers: headers,
    });
  } catch (error) {
    console.error("[Stream] streamText error:", error);
    throw error;
  }
}

// 处理数据块
// function processChunk(
//   chunk: string,
//   controller: ReadableStreamDefaultController<any>
// ) {
//   try {
//     if (!chunk.startsWith("data: ")) {
//       return;
//     }

//     const data = chunk.slice(6);
//     if (data === "[DONE]") {
//       console.log("[Stream] Received DONE signal");
//       controller.enqueue(new TextEncoder().encode("d:[DONE]\n"));
//       return;
//     }

//     // 首先尝试JSON解析
//     try {
//       const parsed = JSON.parse(data);
//       if (parsed.choices?.[0]?.delta?.content) {
//         const content = parsed.choices[0].delta.content;
//         const normalizedContent = normalizeText(content);
//         if (normalizedContent) {
//           console.log(
//             "[Stream] Processing JSON content:",
//             normalizedContent.length,
//             "chars:",
//             normalizedContent
//           );
//           controller.enqueue(
//             new TextEncoder().encode(`0:${normalizedContent}\n`)
//           );
//           return;
//         }
//       }
//     } catch (jsonError) {
//       // JSON解析失败,尝试作为纯文本处理
//       if (data && typeof data === "string") {
//         const normalizedContent = normalizeText(data);
//         if (normalizedContent) {
//           console.log(
//             "[Stream] Processing text content:",
//             normalizedContent.length,
//             "chars:",
//             normalizedContent
//           );
//           controller.enqueue(
//             new TextEncoder().encode(`0:${normalizedContent}\n`)
//           );
//           return;
//         }
//       }
//       console.log("[Stream] Failed to process as JSON or text:", data);
//     }
//   } catch (e) {
//     console.error("[Stream] Error processing chunk:", e, "Raw chunk:", chunk);
//   }
// }
