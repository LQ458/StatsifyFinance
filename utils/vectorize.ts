import { ChromaClient, Collection } from "chromadb";
import { MongoClient } from "mongodb";

// 初始化ChromaDB客户端
const chroma = new ChromaClient();

// 获取MongoDB连接
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(mongoUri);

interface Document {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
}

// 创建或获取collection
async function getCollection(name: string = "finance_docs") {
  const collections = await chroma.listCollections();

  if (!collections.find((c) => c.name === name)) {
    return await chroma.createCollection({
      name,
      metadata: { description: "Finance documents collection" },
    });
  }

  return await chroma.getCollection({
    name,
  });
}

// 将文本分割成较小的块
function splitTextIntoChunks(
  text: string,
  maxChunkSize: number = 1000,
): string[] {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// 向量化并存储文档
export async function vectorizeDocument(doc: Document) {
  try {
    const collection = await getCollection();

    // 分割文档内容
    const chunks = splitTextIntoChunks(doc.content);

    // 准备向量化数据
    const ids = chunks.map((_, index) => `${doc._id}-${index}`);
    const metadatas = chunks.map(() => ({
      docId: doc._id,
      title: doc.title,
      category: doc.category,
    }));

    // 添加到ChromaDB
    await collection.add({
      ids,
      metadatas,
      documents: chunks,
    });

    return true;
  } catch (error) {
    console.error("Error vectorizing document:", error);
    return false;
  }
}

// 向量化所有文档
export async function vectorizeAllDocuments() {
  try {
    await client.connect();
    const db = client.db("finance");

    // 获取所有需要向量化的文档
    const documents = await db.collection("documents").find({}).toArray();

    // 清空现有collection
    const collection = await getCollection();
    await collection.delete();

    // 重新创建collection
    const newCollection = await getCollection();

    // 批量处理文档
    for (const doc of documents) {
      const chunks = splitTextIntoChunks(doc.content);
      const ids = chunks.map((_, index) => `${doc._id}-${index}`);
      const metadatas = chunks.map(() => ({
        docId: doc._id,
        title: doc.title,
        category: doc.category,
      }));

      await newCollection.add({
        ids,
        metadatas,
        documents: chunks,
      });
    }

    return true;
  } catch (error) {
    console.error("Error vectorizing all documents:", error);
    return false;
  } finally {
    await client.close();
  }
}

// 搜索相关文档
export async function searchSimilarDocuments(query: string, limit: number = 3) {
  try {
    const collection = await getCollection();

    const results = await collection.query({
      queryTexts: [query],
      nResults: limit,
    });

    return results;
  } catch (error) {
    console.error("Error searching documents:", error);
    return null;
  }
}
