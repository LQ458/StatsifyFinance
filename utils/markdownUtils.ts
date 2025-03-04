/**
 * Markdown和数学公式处理工具库
 */

/**
 * 处理转义括号，将\[...\]和\(...\)转换为$$和$
 */
export function escapeBrackets(text: string): string {
  const pattern =
    /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g;
  return text.replace(
    pattern,
    (match, codeBlock, squareBracket, roundBracket) => {
      if (codeBlock) {
        return codeBlock;
      } else if (squareBracket) {
        return `$$${squareBracket}$$`;
      } else if (roundBracket) {
        return `$${roundBracket}$`;
      }
      return match;
    },
  );
}

/**
 * 尝试包装HTML代码块
 */
export function wrapHtmlCode(text: string): string {
  return text
    .replace(
      /([`]*?)(\w*?)([\n\r]*?)(<!DOCTYPE html>)/g,
      (match, quoteStart, lang, newLine, doctype) => {
        return !quoteStart ? "\n```html\n" + doctype : match;
      },
    )
    .replace(
      /(<\/body>)([\r\n\s]*?)(<\/html>)([\n\r]*)([`]*)([\n\r]*?)/g,
      (match, bodyEnd, space, htmlEnd, newLine, quoteEnd) => {
        return !quoteEnd ? bodyEnd + space + htmlEnd + "\n```\n" : match;
      },
    );
}

/**
 * 处理各种LaTeX环境和命令，添加适当的美元符号
 */
export function processLatexFormulas(text: string): string {
  // 如果已经包含美元符号，则不做处理
  if (text.includes("$")) return text;

  let processed = text;

  // 处理常见的数学环境
  processed = processed.replace(
    /(\\begin\{(equation|align|gather|multline|cases|array|matrix|pmatrix|bmatrix|vmatrix|Vmatrix)[\*]?\}[\s\S]*?\\end\{\2[\*]?\})/g,
    (match) => (match.startsWith("$") ? match : `$$${match}$$`),
  );

  // 处理独立的LaTeX命令
  processed = processed.replace(
    /(?<![\\$a-zA-Z0-9])(\\(?:frac|sqrt|sum|prod|lim|int|iint|iiint|oint|infty|nabla|partial)(?:\{[^{}]*\})+)(?![\\$a-zA-Z0-9])/g,
    (match) => `$${match}$`,
  );

  // 处理希腊字母和其他常见符号
  processed = processed.replace(
    /(?<![\\$a-zA-Z0-9])(\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega))(?![a-zA-Z])/gi,
    (match) => `$${match}$`,
  );

  return processed;
}

/**
 * 确保数学公式在同一行内
 */
export function ensureInlineFormulaOnSameLine(text: string): string {
  // 将被换行符分割的内联公式重新连接
  return text.replace(/(\$[^\$\n]+)\n([^\$]+\$)/g, "$1$2");
}

/**
 * 处理空白行
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\n\s*\n/g, "\n\n");
}

/**
 * 主函数：预处理Markdown文本
 */
export function preprocessMarkdown(text: string): string {
  // 应用所有处理步骤
  let processed = text;
  processed = escapeBrackets(processed);
  processed = wrapHtmlCode(processed);
  processed = processLatexFormulas(processed);
  processed = ensureInlineFormulaOnSameLine(processed);
  processed = normalizeWhitespace(processed);

  return processed;
}

/**
 * 检测内容是否包含数学公式
 */
export function containsMathFormula(text: string): boolean {
  // 检查是否包含美元符号或LaTeX环境
  return /\$|\\\(|\\\[|\\begin\{(equation|align|gather|multline|cases|array|matrix|pmatrix|bmatrix|vmatrix|Vmatrix)/g.test(
    text,
  );
}

/**
 * 清理数学公式，移除外层的美元符号
 */
export function cleanMathFormula(formula: string): string {
  if (formula.startsWith("$$") && formula.endsWith("$$")) {
    return formula.slice(2, -2).trim();
  } else if (formula.startsWith("$") && formula.endsWith("$")) {
    return formula.slice(1, -1).trim();
  }
  return formula.trim();
}

/**
 * 为公式生成唯一的键，用于React渲染优化
 */
export function generateFormulaKey(formula: string, index: number): string {
  return `math-${index}-${formula.length}`;
}
