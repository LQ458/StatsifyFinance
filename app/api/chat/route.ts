import { NextRequest, NextResponse } from "next/server";
import { getSystemPrompt } from "@/utils/prompt";
import { streamText } from "@/utils/stream";
import { Chat } from "@/models/chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { v4 as uuidv4 } from "uuid";
import { DBconnect } from "@/libs/mongodb";
import { recordProductEvent } from "@/libs/product-events";
import {
  chatRequestSchema,
  jsonInputError,
  MAX_CHAT_BODY_BYTES,
  readJsonBody,
  RequestInputError,
} from "@/libs/request-validation";

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

// 会话管理函数
async function handleSession(
  userId: string,
  conversationId: string | null | undefined,
) {
  try {
    let chat = null;

    if (conversationId) {
      chat = await Chat.findOne(
        {
          userId: String(userId),
          conversationId: String(conversationId),
        },
        {
          conversationId: 1,
          title: 1,
          messages: 1,
        },
      ).lean();
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
    throw new APIError("处理会话失败", 500, "SESSION_ERROR");
  }
}

const GUEST_COOKIE_NAME = "statsify_guest";
const GUEST_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Actor = {
  userId: string;
  isGuest: boolean;
  guestToken?: string;
  setGuestCookie: boolean;
};

async function resolveActor(req: NextRequest): Promise<Actor> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return {
      userId: session.user.id,
      isGuest: false,
      setGuestCookie: false,
    };
  }

  const currentGuestToken = req.cookies.get(GUEST_COOKIE_NAME)?.value;
  const guestToken =
    currentGuestToken && UUID_PATTERN.test(currentGuestToken)
      ? currentGuestToken
      : uuidv4();

  return {
    userId: `guest-${guestToken}`,
    isGuest: true,
    guestToken,
    setGuestCookie: guestToken !== currentGuestToken,
  };
}

function setGuestCookie(response: NextResponse, actor: Actor) {
  if (!actor.isGuest || !actor.guestToken || !actor.setGuestCookie) {
    return;
  }

  response.cookies.set(GUEST_COOKIE_NAME, actor.guestToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
  });
}

function setGuestCookieHeader(headers: Headers, actor: Actor) {
  if (!actor.isGuest || !actor.guestToken || !actor.setGuestCookie) {
    return;
  }

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  headers.append(
    "Set-Cookie",
    `${GUEST_COOKIE_NAME}=${actor.guestToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${GUEST_COOKIE_MAX_AGE}${secure}`,
  );
}

function providerMessages(messages: ChatMessage[]) {
  const maximumCharacters = 12_000;
  const maximumMessages = 20;
  const selected: ChatMessage[] = [];
  let characterCount = 0;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (selected.length >= maximumMessages) {
      break;
    }

    const message = messages[index];
    const remainingCharacters = maximumCharacters - characterCount;
    if (remainingCharacters <= 0) {
      break;
    }

    const content = String(message.content || "").slice(-remainingCharacters);
    selected.unshift({ ...message, content });
    characterCount += content.length;
  }

  return selected;
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req, MAX_CHAT_BODY_BYTES);
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new RequestInputError("Invalid chat request", 400, "INVALID_INPUT");
    }
    const { message, locale, conversationId } = parsed.data;

    await DBconnect();
    const actor = await resolveActor(req);

    // 获取系统提示词
    const systemPrompt = getSystemPrompt(locale);

    // 处理会话
    const chat = await handleSession(actor.userId, conversationId);
    const messages = Array.isArray(chat.messages) ? chat.messages : [];

    // 添加用户消息
    const userMessage = {
      role: "user",
      content: String(message),
      timestamp: new Date(),
    };
    messages.push(userMessage);

    // 调用AI API
    const endpoint = process.env.DEEPSEEK_ALT_BASE_URL;
    const apiKey = process.env.DEEPSEEK_ALT_API_KEY;
    if (!endpoint || !apiKey) {
      throw new APIError("聊天服务暂不可用", 503, "SERVICE_UNAVAILABLE");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_ALT_MODEL ?? "deepseek-ai/DeepSeek-V3",
        messages: [
          { role: "system", content: systemPrompt },
          ...providerMessages(messages).map((msg: ChatMessage) => ({
            role: msg.role,
            content: String(msg.content || ""),
          })),
        ],
        temperature: 0.7,
        stream: true,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new APIError("聊天服务暂不可用", 503, "AI_SERVICE_ERROR");
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
    if (actor.isGuest) {
      headers.set("X-Guest-User", "true");
      setGuestCookieHeader(headers, actor);
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
      await recordProductEvent("chat_submitted", !actor.isGuest);
    });
  } catch (error) {
    if (error instanceof RequestInputError) {
      return jsonInputError(error);
    }

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
export async function GET(request: NextRequest) {
  try {
    await DBconnect();

    const actor = await resolveActor(request);

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    if (
      conversationId &&
      (conversationId.length > 64 || !/^[a-zA-Z0-9-]+$/.test(conversationId))
    ) {
      throw new APIError("无效的conversationId", 400, "INVALID_PARAM");
    }

    const query = conversationId
      ? {
          userId: actor.userId,
          conversationId: String(conversationId),
        }
      : { userId: actor.userId };

    const chats = await Chat.find(query, {
      conversationId: 1,
      title: 1,
      messages: 1,
      createdAt: 1,
      updatedAt: 1,
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    const response = NextResponse.json({ success: true, data: chats });
    setGuestCookie(response, actor);
    return response;
  } catch (error) {
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
export async function DELETE(request: NextRequest) {
  try {
    await DBconnect();

    const actor = await resolveActor(request);

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      throw new APIError("缺少conversationId", 400, "MISSING_PARAM");
    }
    if (conversationId.length > 64 || !/^[a-zA-Z0-9-]+$/.test(conversationId)) {
      throw new APIError("无效的conversationId", 400, "INVALID_PARAM");
    }

    const result = await Chat.deleteOne({
      userId: actor.userId,
      conversationId: String(conversationId),
    });

    if (result.deletedCount === 0) {
      throw new APIError("对话不存在或无权删除", 404, "NOT_FOUND");
    }

    const response = NextResponse.json({ success: true });
    setGuestCookie(response, actor);
    return response;
  } catch (error) {
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
