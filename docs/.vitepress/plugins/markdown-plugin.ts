// ref https://github.com/vuejs/vitepress/blob/main/src/node/markdown/plugins/highlight.ts
import escapeHtml from 'escape-html';
import prism from 'prismjs';
import path from 'path';
import fs from 'fs';
import mdContainer from 'markdown-it-container';
import pkg from '../../package.json';

function wrap(code: string, lang: string): string {
    if (lang === 'text') {
        code = escapeHtml(code);
    }
    return `<pre v-pre style="margin: 0;"><code>${code}</code></pre>`;
}
// 语法高亮
const highlight = (str: string, lang: string) => {
    if (!lang) {
        return wrap(str, 'text');
    }
    lang = lang.toLowerCase();
    const rawLang = lang;
    if (lang === 'vue' || lang === 'html') {
        lang = 'markup';
    }
    if (lang === 'md') {
        lang = 'markdown';
    }
    if (lang === 'ts') {
        lang = 'typescript';
    }
    if (lang === 'py') {
        lang = 'python';
    }
    if (prism.languages[lang]) {
        const code = prism.highlight(str, prism.languages[lang], lang);
        return wrap(code, rawLang);
    }
    return wrap(str, 'text');
};
// 配置
export const markdownConfig = (md) => {
    // tooltip
    md.renderer.rules.tooltip = (tokens, idx) => {
        const token = tokens[idx];
        return `<api-typing type="${token.content}" details="${token.info}" />`;
    };
    md.inline.ruler.before('emphasis', 'tooltip', (state, silent) => {
        const tooltipRegExp = /^\^\[([^\]]*)\](`[^`]*`)?/;
        const str = state.src.slice(state.pos, state.posMax);
        if (!tooltipRegExp.test(str)) return false;
        if (silent) return true;
        const result = str.match(tooltipRegExp);
        if (!result) return false;
        const token = state.push('tooltip', 'tooltip', 0);
        token.content = result[1].replace(/\\\|/g, '|');
        token.info = (result[2] || '').replace(/^`(.*)`$/, '$1');
        token.level = state.level;
        state.pos += result[0].length;

        return true;
    });
    md.inline.ruler.before('emphasis', 'tag', (state, silent) => {
        const tagRegExp = /^\^\(([^)]*)\)/;
        const str = state.src.slice(state.pos, state.posMax);

        if (!tagRegExp.test(str)) return false;
        if (silent) return true;

        const result = str.match(tagRegExp);

        if (!result) return false;

        const token = state.push('html_inline', '', 0);
        const value = result[1].trim();
        /**
         * Add styles for some special tags
         * vitepress/styles/content/tag-content.scss
         */
        const tagClass = ['beta', 'deprecated', 'a11y', 'required'].includes(value) ? value : '';
        token.content = `<span class="vp-tag ${tagClass}">${value}</span>`;
        token.level = state.level;
        state.pos += result[0].length;

        return true;
    });
    md.use(mdContainer, 'code', {
        validate(params) {
            return !!params.trim().match(/^code\s*(.*)$/);
        },
        render(tokens, idx) {
            const m = tokens[idx].info.trim().match(/^code\s*(.*)$/);
            if (tokens[idx].nesting === 1 /* means the tag is opening */) {
                // 取出:::demo 后面的配置，即源码路径
                const title = m && m.length > 1 ? m[1] : '';
                
                const sourceFileToken = tokens[idx + 2];
                let source = '';
                const sourceFile = sourceFileToken.children?.[0].content ?? '';
                const fileType = sourceFile.split('.').pop();
                
                if (sourceFileToken.type === 'inline') {
                    source = fs.readFileSync(
                        path.resolve(process.cwd(), 'examples', `${sourceFile}`),
                        'utf-8',
                    );
                }
                const sourcePath = `/examples/${sourceFile}`;
                if (!source) throw new Error(`Incorrect source file: ${sourceFile}`);
                return `<ShowCode source="${encodeURIComponent(
                    highlight(source, fileType),
                )}" path="${sourcePath}" title="${title}" raw-source="${encodeURIComponent(source)}" >\n`;
            } else {
                return '</ShowCode>\n';
            }
        },
    });
    md.use(mdContainer, 'demo', {
        validate(params) {
            return !!params.trim().match(/^demo\s*(.*)$/);
        },
        render(tokens, idx) {
            const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);
            if (tokens[idx].nesting === 1 /* means the tag is opening */) {
                // 取出:::demo 后面的配置，即源码路径
                const description = m && m.length > 1 ? m[1] : '';
                const sourceFileToken = tokens[idx + 2];
                let source = '';
                const sourceFile = sourceFileToken.children?.[0].content ?? '';
                let height = '400px';
                let width = '100%';
                const heightContent = sourceFileToken.children.find(
                    (child) => child.type === 'text' && child.content.includes('h:'),
                );
                if (heightContent) {
                    height = heightContent.content.split('h:')[1];
                }
                const widthContent = sourceFileToken.children.find(
                    (child) => child.type === 'text' && child.content.includes('w:'),
                );
                if (widthContent) {
                    width = widthContent.content.split('w:')[1];
                }

                if (sourceFileToken.type === 'inline') {
                    const _source = fs.readFileSync(
                        path.resolve(process.cwd(), 'examples', `${sourceFile}.html`),
                        'utf-8',
                    );
                    // 替换版本号
                    source = _source.replace(
                        '<script src="https://unpkg.com/e-virt-table/dist/index.umd.js"></script>',
                        `<script src="https://unpkg.com/e-virt-table@${pkg.version}/dist/index.umd.js"></script>`,
                    );
                }
                const sourcePath = `/examples/${sourceFile}.html`;
                if (!source) throw new Error(`Incorrect source file: ${sourceFile}`);
                return `<Demo source="${encodeURIComponent(
                    highlight(source, 'html'),
                )}" path="${sourcePath}"  height="${height}" width="${width}" description="${encodeURIComponent(
                    md.render(description),
                )}" raw-source="${encodeURIComponent(source)}" >\n`;
            } else {
                return '</Demo>\n';
            }
        },
    });
};
