import dynamic from "next/dynamic";
import { useCallback } from "react";
import MarkdownIt from "markdown-it";
import mk from "markdown-it-katex";
import mh from "markdown-it-highlightjs";

// 样式文件
import "react-markdown-editor-lite/lib/index.css";
import "katex/dist/katex.min.css"; // KaTeX 样式
import "highlight.js/styles/github.css"; // 你也可以换成别的主题

// 动态导入编辑器组件
const MdEditor = dynamic(
  () => import("react-markdown-editor-lite").then((mod) => mod.default),
  {
    ssr: false,
  },
);

// Markdown-it 实例 + 插件
const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
  .use(mk)
  .use(mh);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({
  value,
  onChange,
}: MarkdownEditorProps) {
  const handleEditorChange = useCallback(
    ({ text }: { text: string }) => {
      onChange(text);
    },
    [onChange],
  );

  return (
    <MdEditor
      value={value}
      style={{ height: "350px", backgroundColor: '#999' }}
      renderHTML={(text) => mdParser.render(text)}
      onChange={handleEditorChange}
    />
  );
}
