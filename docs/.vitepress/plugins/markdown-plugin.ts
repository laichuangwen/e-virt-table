// ref https://github.com/vuejs/vitepress/blob/main/src/node/markdown/plugins/highlight.ts
import escapeHtml from "escape-html";
import prism from "prismjs";
import path from "path";
import fs from "fs";
import mdContainer from "markdown-it-container";

function wrap(code: string, lang: string): string {
  if (lang === "text") {
    code = escapeHtml(code);
  }
  return `<pre v-pre style="margin: 0;"><code>${code}</code></pre>`;
}
// 语法高亮
const highlight = (str: string, lang: string) => {
  if (!lang) {
    return wrap(str, "text");
  }
  lang = lang.toLowerCase();
  const rawLang = lang;
  if (lang === "vue" || lang === "html") {
    lang = "markup";
  }
  if (lang === "md") {
    lang = "markdown";
  }
  if (lang === "ts") {
    lang = "typescript";
  }
  if (lang === "py") {
    lang = "python";
  }
  if (prism.languages[lang]) {
    const code = prism.highlight(str, prism.languages[lang], lang);
    return wrap(code, rawLang);
  }
  return wrap(str, "text");
};
// 配置
export const markdownConfig = (md) => {
  md.use(mdContainer, "demo", {
    validate(params) {
      return !!params.trim().match(/^demo\s*(.*)$/);
    },

    render(tokens, idx) {
      if (tokens[idx].nesting === 1 /* means the tag is opening */) {
        // 取出:::demo 后面的配置，即源码路径
        const { content } = tokens[idx + 1];
        if (!content) return "";
        const match = content.match(/src="([^"]+)"/);
        const url = match ? match[1] : null;
        if (!url) return "";
        // 源码文件路径
        const filePath = path.join(process.cwd(), "public", url);
        const source = fs.readFileSync(filePath, "utf-8");
        if (!source) throw new Error(`Incorrect source file: ${filePath}`);
        return `<Demo source="${encodeURIComponent(
          highlight(source, "html")
        )}" raw-source="${encodeURIComponent(source)}" >\n`;
      } else {
        return "</Demo>\n";
      }
    },
  });
};
