import { vectorizeAllDocuments } from "@/utils/vectorize";

async function main() {
  console.log("开始初始化向量数据库...");

  try {
    const success = await vectorizeAllDocuments();

    if (success) {
      console.log("向量数据库初始化成功!");
    } else {
      console.error("向量数据库初始化失败.");
    }
  } catch (error) {
    console.error("初始化过程中发生错误:", error);
  }
}

main().catch(console.error);
