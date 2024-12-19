import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pageType } = await request.json();
    
    // 根据页面类型生成建议的topics
    const topics = pageType === 'quantitative' ? [
      {
        title: "什么是量化分析中的Alpha策略?",
        content: "Alpha策略是一种..."
      },
      {
        title: "如何理解夏普比率(Sharpe Ratio)?",
        content: "夏普比率是衡量投资组合..."
      },
      {
        title: "Beta系数在量化分析中的应用",
        content: "Beta系数用于衡量..."
      }
    ] : [
      {
        title: "ESG分析的主要维度有哪些?",
        content: "ESG分析包括环境、社会和治理..."
      },
      {
        title: "如何评估公司的品牌价值?",
        content: "品牌价值评估通常考虑..."
      },
      {
        title: "企业文化对公司发展的影响",
        content: "企业文化是公司的灵魂..."
      }
    ];

    return NextResponse.json({ 
      success: true,
      topics 
    });

  } catch (error) {
    console.error('Suggest Topics API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate topics' },
      { status: 500 }
    );
  }
} 