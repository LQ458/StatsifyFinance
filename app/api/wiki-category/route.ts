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

    const articles = await Articles.find(articleQuery)
      .sort({ createdAt: -1 })
      .lean();

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
    const processedCategories = new Set<string>();

    // 先处理顶级分类
    categories.forEach((cat: any) => {
      const id = String(cat._id);

      // 如果在搜索模式下且不在结果集中，跳过
      if (title && !finalCategorySet.has(id)) return;

      // 如果没有parentId或parentId为空，则为顶级分类
      if (!cat.parentId || cat.parentId === "") {
        tree.push(cat);
        processedCategories.add(id);
      }
    });

    // 再处理子分类
    let hasChanges = true;
    while (hasChanges) {
      hasChanges = false;
      categories.forEach((cat: any) => {
        const id = String(cat._id);

        // 如果已经处理过或在搜索模式下不在结果集中，跳过
        if (processedCategories.has(id) || (title && !finalCategorySet.has(id)))
          return;

        // 如果有parentId且父分类已经处理过
        if (cat.parentId && processedCategories.has(String(cat.parentId))) {
          const parent = categoryMap.get(String(cat.parentId));
          if (parent) {
            parent.children.push(cat);
            processedCategories.add(id);
            hasChanges = true;
          }
        }
      });
    }

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
