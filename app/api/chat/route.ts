import { NextResponse } from "next/server";
import { z } from "zod";
import { getSystemPrompt } from "@/utils/prompt";
import { streamText } from "@/utils/stream";
import { Chat } from "@/models/chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { v4 as uuidv4 } from "uuid";
import { DBconnect } from "@/libs/mongodb";

// 类型定义
interface ChatQuery {
  userId: string;
  conversationId?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

// 请求体验证schema
const requestSchema = z.object({
  message: z.string().min(1).max(1000),
  locale: z.string(),
  conversationId: z.string().nullable().optional(),
});

// 错误类型定义
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_SERVER_ERROR",
  ) {
    super(message);
    this.name = "APIError";
  }
}

// 请求验证函数
async function validateRequest(req: Request) {
  try {
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      throw new APIError("无效的请求参数", 400, "INVALID_REQUEST");
    }

    return result.data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError("请求参数验证失败", 400, "VALIDATION_ERROR");
    }
    throw error;
  }
}

// 会话管理函数
async function handleSession(
  userId: string,
  conversationId: string | null | undefined,
) {
  try {
    let chat = null;

    if (conversationId) {
      chat = await Chat.findOne({
        userId: String(userId),
        conversationId: String(conversationId),
      }).lean();
    }

    if (!chat) {
      const newChat = {
        userId: String(userId),
        conversationId: conversationId || uuidv4(),
        title: "",
        messages: [] as ChatMessage[],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const chatDoc = new Chat(newChat);
      await chatDoc.save();
      chat = chatDoc.toObject();
    }

    return chat;
  } catch (error) {
    console.error("Error handling chat session:", error);
    throw new APIError("处理会话失败", 500, "SESSION_ERROR");
  }
}

// 为访客用户生成ID
function generateGuestId(req: Request) {
  // 使用IP地址和用户代理作为唯一标识的基础
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  const userAgent = req.headers.get("user-agent") || "unknown-ua";

  // 使用简单的哈希函数计算唯一标识
  let hash = 0;
  const str = `${ip}-${userAgent}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32bit整数
  }

  // 返回前缀为guest的ID
  return `guest-${Math.abs(hash)}`;
}

export async function POST(req: Request) {
  try {
    // 确保数据库连接
    await DBconnect();

    // 验证请求
    const { message, locale, conversationId } = await validateRequest(req);

    // 验证用户会话
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    let isGuest = false;

    // 如果用户未登录，生成访客ID
    if (!userId) {
      userId = generateGuestId(req);
      isGuest = true;
    }

    // 获取系统提示词
    const systemPrompt = getSystemPrompt(locale);

    // 处理会话
    const chat = await handleSession(userId, conversationId);
    const messages = Array.isArray(chat.messages) ? chat.messages : [];

    // 添加用户消息
    const userMessage = {
      role: "user",
      content: String(message),
      timestamp: new Date(),
    };
    messages.push(userMessage);

    // 调用AI API
    console.log("[Chat] Calling AI API");
    const response = await fetch(process.env.DEEPSEEK_ALT_BASE_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_ALT_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_ALT_MODEL ?? "deepseek-ai/DeepSeek-V3",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((msg: ChatMessage) => ({
            role: msg.role,
            content: String(msg.content || ""),
          })),
        ],
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new APIError(
        `AI服务错误: ${response.status}`,
        503,
        "AI_SERVICE_ERROR",
      );
    }

    // 设置响应头
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    if (chat?.conversationId) {
      headers.set("X-Conversation-Id", String(chat.conversationId));
    }

    // 设置访客标志
    if (isGuest) {
      headers.set("X-Guest-User", "true");
    }

    // 添加助手消息到数据库
    const assistantMessage = {
      role: "assistant",
      content: "", // 内容将在流式响应中生成
      timestamp: new Date(),
    };
    messages.push(assistantMessage);

    // 更新聊天记录标题 (如果是第一条消息)
    if (messages.length <= 2) {
      chat.title =
        message.length > 20 ? message.substring(0, 20) + "..." : message;
    }

    // 更新数据库
    await Chat.updateOne(
      { conversationId: chat.conversationId },
      {
        $set: {
          messages: messages,
          title: chat.title,
          updatedAt: new Date(),
        },
      },
    );

    return streamText(response, headers, async (content) => {
      // 在流结束时更新助手消息的内容
      if (content) {
        await Chat.updateOne(
          {
            conversationId: chat.conversationId,
            "messages.timestamp": assistantMessage.timestamp,
          },
          {
            $set: { "messages.$.content": content },
          },
        );
      }
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    if (error instanceof APIError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "服务器内部错误",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}

// 获取聊天历史
export async function GET(request: Request) {
  try {
    await DBconnect();

    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // 如果用户未登录，尝试使用访客ID
    if (!userId) {
      userId = generateGuestId(request);
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    const query = conversationId
      ? {
          userId: String(userId),
          conversationId: String(conversationId),
        }
      : { userId: String(userId) };

    const chats = await Chat.find(query)
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ success: true, data: chats });
  } catch (error) {
    console.error("Get chat history error:", error);

    if (error instanceof APIError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "获取历史记录失败",
        code: "HISTORY_ERROR",
      },
      { status: 500 },
    );
  }
}

// 删除聊天记录
export async function DELETE(request: Request) {
  try {
    await DBconnect();

    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // 如果用户未登录，尝试使用访客ID
    if (!userId) {
      userId = generateGuestId(request);
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      throw new APIError("缺少conversationId", 400, "MISSING_PARAM");
    }

    const result = await Chat.deleteOne({
      userId: String(userId),
      conversationId: String(conversationId),
    });

    if (result.deletedCount === 0) {
      throw new APIError("对话不存在或无权删除", 404, "NOT_FOUND");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chat error:", error);

    if (error instanceof APIError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "删除失败",
        code: "DELETE_ERROR",
      },
      { status: 500 },
    );
  }
}
