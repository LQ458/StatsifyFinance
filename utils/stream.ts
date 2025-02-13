import { ReadableStream } from "stream/web";

// 处理多余空行的函数
function normalizeText(text: string): string {
  return text
    .replace(/\n{3,}/g, "\n\n") // 将3个及以上连续换行替换为2个
    .replace(/\n\s+\n/g, "\n\n") // 删除空行中的空格
    .replace(/([：:])\n{2,}/g, "$1\n") // 标题后的多个换行替换为单个换行
    .replace(/\n{2,}([•\-\d])/g, "\n$1"); // 列表项前的多个换行替换为单个换行
}

export async function streamText(response: Response): Promise<Response> {
  try {
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 获取响应流
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

    // 返回新的响应
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("streamText error:", error);
    throw error;
  }
}
