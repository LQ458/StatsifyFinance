import Category from "@/models/wiki-category";
import Articles from "@/models/wiki-articles";
import { DBconnect } from "@/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

export const GET = async (req: NextRequest) => {
  const title = (req.nextUrl.searchParams.get("title") as string) || "";

  try {
    await DBconnect();

    // 1. 获取所有分类
    const categories = await Category.find().sort({ order: 1 }).lean();
    const categoryMap = new Map<string, any>();
    categories.forEach((cat: any) => {
      cat.children = [];
      cat.articles = [];
      categoryMap.set(String(cat._id), cat);
    });

    // 2. 获取匹配的文章
    const articleQuery: any = {};
    if (title) {
      articleQuery.$or = [
        { title: { $regex: title, $options: "i" } },
        { enTitle: { $regex: title, $options: "i" } },
      ];
    }

    const articles = await Articles.find(articleQuery).sort({ createdAt: -1 }).lean();

    // 3. 文章挂到对应分类
    const matchedCategoryIds = new Set<string>();
    articles.forEach((article: any) => {
      const catId = String(article.category);
      const category = categoryMap.get(catId);
      if (category) {
        category.articles.push(article);
        matchedCategoryIds.add(catId);
      }
    });

    // 4. 处理搜索：保留匹配文章分类及其祖先分类
    let finalCategorySet = new Set<string>();
    if (title) {      
      for (const id of Array.from(matchedCategoryIds)) {
        const current = categoryMap.get(id);
        if (current) {
          finalCategorySet.add(id);
          (current.path || []).forEach((ancestorId: Types.ObjectId) => {
            finalCategorySet.add(String(ancestorId));
          });
        }
      }
    }

    // 5. 构建树结构
    const tree: any[] = [];

    categories.forEach((cat: any) => {
      const id = String(cat._id);

      if (title && !finalCategorySet.has(id)) return;

      if (cat.parentId) {
        const parent = categoryMap.get(String(cat.parentId));
        if (parent) {
          parent.children.push(cat);
        }
      } else {
        tree.push(cat);
      }
    });

    return NextResponse.json({
      success: true,
      data: tree,
    });

  } catch (err) {
    console.error("分类树获取失败:", err);
    return NextResponse.json({
      success: false,
      errorMessage: "服务器错误",
    });
  }
};
