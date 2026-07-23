import mongoose, { type Model } from "mongoose";
import { DBconnect } from "@/libs/mongodb";
import Articles from "@/models/articles";
import Category from "@/models/category";
import { Chat } from "@/models/chat";
import FinanceTerms from "@/models/finance-terms";
import Learn from "@/models/learn";
import { ProductEvent, PRODUCT_EVENT_NAMES } from "@/models/product-event";
import User from "@/models/user";
import WikiArticles from "@/models/wiki-articles";
import WikiCategory from "@/models/wiki-category";

const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
let aggregationStage = "connect";

async function countMessages() {
  const result = await Chat.collection
    .aggregate<{ value: number }>([
      {
        $project: {
          count: { $size: { $ifNull: ["$messages", []] } },
        },
      },
      {
        $group: {
          _id: null,
          value: { $sum: "$count" },
        },
      },
    ])
    .toArray();
  return result[0]?.value ?? 0;
}

async function countDistinctChatActors(
  match: Record<string, unknown>,
): Promise<number> {
  const result = await Chat.collection
    .aggregate<{ value: number }>([
      { $match: match },
      { $group: { _id: "$userId" } },
      { $count: "value" },
    ])
    .toArray();
  return result[0]?.value ?? 0;
}

async function countActiveAuthenticatedAccounts(since: Date): Promise<number> {
  const result = await Chat.collection
    .aggregate<{ value: number }>([
      {
        $match: {
          userId: { $not: /^guest-/ },
          updatedAt: { $gte: since },
        },
      },
      {
        $set: {
          userObjectId: {
            $convert: {
              input: "$userId",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      { $match: { userObjectId: { $ne: null } } },
      {
        $lookup: {
          from: User.collection.name,
          localField: "userObjectId",
          foreignField: "_id",
          as: "matchedAccount",
        },
      },
      { $match: { "matchedAccount.0": { $exists: true } } },
      { $group: { _id: "$userObjectId" } },
      { $count: "value" },
    ])
    .toArray();
  return result[0]?.value ?? 0;
}

async function aggregateCount(
  model: Model<unknown>,
  match: Record<string, unknown> = {},
): Promise<number> {
  const result = await model.collection
    .aggregate<{ value: number }>([{ $match: match }, { $count: "value" }])
    .toArray();
  return result[0]?.value ?? 0;
}

async function eventCounts(eventCollectionExists: boolean, since?: Date) {
  if (!eventCollectionExists) {
    return null;
  }

  const match = since ? { createdAt: { $gte: since } } : {};
  const rows = await ProductEvent.collection
    .aggregate<{
      _id: string;
      value: number;
    }>([{ $match: match }, { $group: { _id: "$event", value: { $sum: 1 } } }])
    .toArray();
  const counts = Object.fromEntries(
    PRODUCT_EVENT_NAMES.map((event) => [event, 0]),
  ) as Record<(typeof PRODUCT_EVENT_NAMES)[number], number>;
  for (const row of rows) {
    if (PRODUCT_EVENT_NAMES.includes(row._id as never)) {
      counts[row._id as keyof typeof counts] = row.value;
    }
  }
  return counts;
}

async function timestampBounds(
  model: Model<unknown>,
  fields: string[],
): Promise<Date[]> {
  const result = await model.collection
    .aggregate<{
      earliest: Date;
      latest: Date;
    }>([
      {
        $project: {
          values: fields.map((field) => `$${field}`),
        },
      },
      { $unwind: "$values" },
      {
        $match: {
          $expr: { $eq: [{ $type: "$values" }, "date"] },
        },
      },
      {
        $group: {
          _id: null,
          earliest: { $min: "$values" },
          latest: { $max: "$values" },
        },
      },
    ])
    .toArray();

  return result[0] ? [result[0].earliest, result[0].latest] : [];
}

async function main() {
  aggregationStage = "connect";
  await DBconnect();
  const database = mongoose.connection.db;
  if (!database) {
    throw new Error("Database is unavailable");
  }

  aggregationStage = "collection-metadata";
  const eventCollectionExists = await database
    .listCollections({ name: ProductEvent.collection.name })
    .hasNext();

  aggregationStage = "registered-accounts";
  const registeredAccounts = await aggregateCount(User);
  aggregationStage = "conversations";
  const totalConversations = await aggregateCount(Chat);
  const totalMessages = await countMessages();
  aggregationStage = "anonymous-conversation-identifiers";
  const anonymousConversationIdentifiers = await countDistinctChatActors({
    userId: /^guest-/,
  });
  aggregationStage = "authenticated-activity";
  const activeAuthenticated30Days =
    await countActiveAuthenticatedAccounts(thirtyDaysAgo);
  const activeAuthenticated90Days =
    await countActiveAuthenticatedAccounts(ninetyDaysAgo);
  aggregationStage = "content-counts";
  const articles = await aggregateCount(Articles);
  const categories = await aggregateCount(Category);
  const financialTerms = await aggregateCount(FinanceTerms);
  const learningRecords = await aggregateCount(Learn);
  const wikiArticles = await aggregateCount(WikiArticles);
  const wikiCategories = await aggregateCount(WikiCategory);
  aggregationStage = "product-events";
  const eventsAll = await eventCounts(eventCollectionExists);
  const events30Days = await eventCounts(eventCollectionExists, thirtyDaysAgo);
  const events90Days = await eventCounts(eventCollectionExists, ninetyDaysAgo);
  aggregationStage = "activity-timestamps";
  const userDates = await timestampBounds(User, ["createdAt", "updatedAt"]);
  const chatDates = await timestampBounds(Chat, ["createdAt", "updatedAt"]);
  const eventDates = eventCollectionExists
    ? await timestampBounds(ProductEvent, ["createdAt"])
    : [];

  const activityDates = [...userDates, ...chatDates, ...eventDates];
  const timestamps =
    activityDates.length > 0
      ? {
          earliest: new Date(
            Math.min(...activityDates.map((date) => date.getTime())),
          ).toISOString(),
          latest: new Date(
            Math.max(...activityDates.map((date) => date.getTime())),
          ).toISOString(),
        }
      : { earliest: null, latest: null };

  console.log(
    JSON.stringify(
      {
        generatedAt: now.toISOString(),
        accounts: {
          registeredAccounts,
          definition: "User documents counted by immutable _id",
        },
        authenticatedActivity: {
          last30Days: activeAuthenticated30Days,
          last90Days: activeAuthenticated90Days,
          definition:
            "Distinct non-guest Chat.userId values with Chat.updatedAt in the window that match an existing User._id",
        },
        anonymousConversationIdentifiers: {
          value: anonymousConversationIdentifiers,
          definition:
            "Distinct guest-prefixed Chat.userId values; not people or users",
        },
        conversations: {
          totalConversations,
          totalMessages,
        },
        productEvents: {
          available: eventCollectionExists,
          allAvailable: eventsAll,
          last30Days: events30Days,
          last90Days: events90Days,
          limitation:
            "Counts only events recorded after server-side instrumentation was deployed",
        },
        content: {
          articles,
          categories,
          financialTerms,
          learningRecords,
          wikiArticles,
          wikiCategories,
        },
        activityTimestamps: timestamps,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error: unknown) => {
    const safeError = error as {
      name?: string;
      code?: string | number;
      codeName?: string;
    };
    console.error(
      JSON.stringify({
        error: "Usage aggregation failed",
        name: safeError.name ?? "Error",
        code: safeError.code ?? null,
        codeName: safeError.codeName ?? null,
        stage: aggregationStage,
      }),
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
