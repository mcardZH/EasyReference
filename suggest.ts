import EasyReferencePlugin from "main";
import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, MarkdownView, TFile } from "obsidian";


export class Reference {
    label: string;
    caption: string;
    type: string;
    constructor(label: string, caption: string, type: string) {
        this.label = label;
        this.caption = caption;
        this.type = type;
    }
}

const availableTypes = ["fig", "tbl", "sec"];
const typesTip = {
    "fig": "图",
    "tbl": "表",
    "sec": "章节"
}
const subFigNames = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

export class ReferenceSuggest extends EditorSuggest<Reference> {

    private plugin: EasyReferencePlugin;

    constructor(app: App, plugin: EasyReferencePlugin) {
        super(app);
        this.plugin = plugin;
    }
    
    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile | null): EditorSuggestTriggerInfo | null {
        // 获取当前行
        let line = editor.getLine(cursor.line);
        // 从当前光标位置往前找[
        const index = line.lastIndexOf("[", cursor.ch);
        if (index === -1) {
            return null;
        }
        // 获取[到本行结尾之间的内容，如果存在]，则获取]前面的内容
        line = line.slice(index, line.length);
        if (line.includes("]")) {
            line = line.slice(0, line.indexOf("]") + 1);
        }
        // 如果不是[@开头，跳过
        if (!line.startsWith("[@")) { 
            return null;
        }
        // 检查当前输入位置前面是否存在【;】
        const prevChar = line.slice(0, cursor.ch - index);
        if (prevChar.lastIndexOf(";") !== -1) {
            // 存在的话，将line;前面的内容去掉
            line = prevChar.slice(prevChar.lastIndexOf(";") + 1, prevChar.length) + line.replace(prevChar, "");
            line = "[" + line;
            if (line.indexOf(";") !== -1) {
                line = line.slice(0, line.lastIndexOf(";"));
                line += "]";
            }
        }

        // 如果不是[@开头，跳过
        if (!line.startsWith("[@")) { 
            return null;
        }

        // 寻找:，看是否已经确定类型
        const colonIndex = line.indexOf(":");
        let type = "";
        if (colonIndex === -1) {
            // 未确定类型
            // 获取@后面到
            type = line.slice(2, line.indexOf("]"));
            // 和 availableTypes 对比，看看是否是未完成的类型
            for (const t of availableTypes) { 
                if (t.startsWith(type)) { 
                    return {
                        start: {
                            line: cursor.line,
                            ch: index
                        },
                        end: {
                            line: cursor.line,
                            ch: index + colonIndex
                        },
                        query: `type|${type}`
                    }
                }
            }
        } else {
            // 获取类型
            type = line.slice(2, colonIndex);
            // 如果已经确定类型，则检查这个类型是否在支持列表中
            if (availableTypes.includes(type)) { 
                return {
                    start: {
                        line: cursor.line,
                        ch: index
                    },
                    end: {
                        line: cursor.line,
                        ch: index + colonIndex
                    },
                    query: `id|${type}|${line.slice(colonIndex + 1, line.length - 1)}`
                }
            }
        }
        
        return null;
    }
    getSuggestions(context: EditorSuggestContext): Reference[] | Promise<Reference[]> {
        // 如果是以type|开头，则从availableTypes中获取
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return [];
        }
        const editor = view.editor;
        if (!editor) { 
            return [];
        }
        if (context.query.startsWith("type|")) {
            const type = context.query.slice(5);
            // 从 query 中提取|后面的内容
            const userInput = context.query.slice(context.query.indexOf("|") + 1);
            return availableTypes.filter(t => t.startsWith(type)).map(t => new Reference(t, t.replace(userInput, ""), "type"));
        }
        else if (context.query.startsWith("id|")) {
            const [type, id] = context.query.slice(3).split("|");
            const references: Reference[] = [];
            if (type === "fig") {
                // 查找当前文件中所有带 ID 的图片
                const markdownImageLinkWithTagRegex = /!\[(.*?)\]\((.*?)\){#fig:(.*?)}/;
                // <div id="fig:figureRef">如果符合这种格式则说明是子图
                const subFigRegex = /<div id="fig:(.*?)">/;
                // 如果遇到</div>，则说明子图结束
                const subFigEndRegex = /<\/div>/;
                let photoCount = 0;
                let subFigCount = 0;
                let subFigFlag = false;
                // 读入当前文件的frontmatter中figureTitle，如果没有这一项，则为Figure
                //@ts-ignore
                const frontmatter = this.app.metadataCache.getFileCache(view.file)?.frontmatter;
                let figureTitle = "Figure";
                if (frontmatter && frontmatter.figureTitle) {
                    figureTitle = frontmatter.figureTitle;
                }
                for (let i = 0; i < editor.lineCount(); i++) {
                    const line = editor.getLine(i);
                    const matches = line.match(markdownImageLinkWithTagRegex);
                    const subFigMatches = line.match(subFigRegex);
                    const subFigEndMatches = line.match(subFigEndRegex);
                    if (subFigMatches) {
                        subFigFlag = true;
                        photoCount++;
                    } else if (subFigEndMatches) {
                        subFigCount = 0;
                        subFigFlag = false;
                    }
                    if (matches) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const [_, description, link, pid] = matches;
                        let subFigPid = "";
                        if (subFigFlag) {
                            subFigCount++;
                            subFigPid = subFigNames[subFigCount - 1];
                        } else {
                            photoCount++;
                        }
                        if (pid.includes(id)) {
                            if (subFigCount > 0) {
                                references.push(new Reference(pid, `${figureTitle} ${photoCount}(${subFigPid})：` + description, "fig"));
                            } else {
                                references.push(new Reference(pid, `${figureTitle} ${photoCount}：` + description, "fig"));
                            }
                        }
                    }
                }
                
            } else if (type === "tbl") {
                // 查找当前文件中所有带 ID 的表格
                const markdownTableLinkWithTagRegex = /:(.*?)\{#tbl:(.*?)\}$/;
                let tableCount = 0;
                // 读入当前文件的frontmatter中tableTitle，如果没有这一项，则为Table
                //@ts-ignore
                const frontmatter = this.app.metadataCache.getFileCache(view.file)?.frontmatter;
                let tableTitle = "Table";
                if (frontmatter && frontmatter.tableTitle) {
                    tableTitle = frontmatter.tableTitle;
                }
                for (let i = 0; i < editor.lineCount(); i++) {
                    const line = editor.getLine(i);
                    const matches = line.match(markdownTableLinkWithTagRegex);
                    if (matches) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const [_, caption, tid] = matches;
                        tableCount++;
                        if (tid.includes(id)) {
                            // caption去除左右空格
                            references.push(new Reference(tid, `${tableTitle} ${tableCount}：` + caption.trim(), "tbl"));
                        }
                    }
                }
            } else if (type === "sec") { 
                // 查找当前文件中所有带 ID 的章节
                // 获取文档中所有的标题行
                const lastLevelCounter: Record<number, number> = {};
                for (let i = 0; i < editor.lineCount(); i++) {
                    const line = editor.getLine(i);
                    if (line.startsWith("#")) {
                        const headLevel = line.match(/^#+/)?.[0].length;
                        let title = line.substring(headLevel?headLevel:0 + 1).trim();
                        // 如果 title 后面包括 {#sec:xxx}，则提取出 xxx 并移除这部分
                        const secId = title.match(/{#sec:(.*?)}/)?.[1];
                        if (secId) {
                            title = title.replace(/{#sec:.*?}/, "").trim();
                        }
                        let levelStr = "";
                        if (headLevel) {
                            // 如果 lastLevelCounter[headLevel] 不存在，则设置为0
                            if (!lastLevelCounter[headLevel]) {
                                lastLevelCounter[headLevel] = 0;
                            }
                            // 如果 lastLevelCounter[headLevel] 存在，则加 1
                            lastLevelCounter[headLevel]++;
                            // 同时将比他大的level的counter都设置为0
                            for (let j = headLevel + 1; j <= 6; j++) {
                                lastLevelCounter[j] = 0;
                            }
                            // 构建标题层级 x.x.x
                            for (let j = 1; j <= headLevel; j++) {
                                levelStr += lastLevelCounter[j] + ".";
                            }
                            levelStr = levelStr.slice(0, levelStr.length - 1);
                        }
                        if (secId) {
                            references.push(new Reference(headLevel + "|" + secId, levelStr + "|" + title, "sec"));
                        } else {
                            references.push(new Reference(headLevel + "-" + i, levelStr + "|" + title, "sec"));
                        }
                    }
                }
                
            }

            return references;
        }

        return []
    }
    renderSuggestion(value: Reference, el: HTMLElement): void {
        // 如果 type 为 type，则渲染一个列表
        if (value.type === "type") {
            const list = availableTypes.filter(t => t.startsWith(value.label)).map(t => new Reference(t, t, "type"));
            for (const item of list) {
                const div = document.createElement("div");
                // div 中有两个 span，一个显示类型，一个显示类型提示
                const typeSpan = document.createElement("span");
                typeSpan.textContent = item.label;
                const typeTipSpan = document.createElement("span");
                typeTipSpan.textContent = typesTip[item.label as keyof typeof typesTip];
                // 两个 span，第二个的字体是第一个的 80%，颜色为灰色
                typeSpan.style.fontSize = "80%";
                typeSpan.style.color = "gray";
                div.appendChild(typeTipSpan);
                div.appendChild(typeSpan);
                el.appendChild(div);
            }
        } else if (value.type === "fig") {
            // 如果 type 为 fig
            const div = document.createElement("div");
            // div 中有两个 span，一个显示类型，一个显示类型提示
            const typeSpan = document.createElement("span");
            typeSpan.textContent = value.label;
            const typeTipSpan = document.createElement("span");
            typeTipSpan.textContent = value.caption;
            // 两个 span，第二个的字体是第一个的 80%，颜色为灰色
            typeSpan.style.display = "block";
            typeTipSpan.style.display = "block";
            typeSpan.style.fontSize = "80%";
            typeSpan.style.color = "gray";
            div.appendChild(typeTipSpan);
            div.appendChild(typeSpan);
            el.appendChild(div);
        } else if (value.type === "tbl") {
            const div = document.createElement("div");
            // div 中有两个 span，一个显示类型，一个显示类型提示
            const typeSpan = document.createElement("span");
            typeSpan.textContent = value.label;
            const typeTipSpan = document.createElement("span");
            typeTipSpan.textContent = value.caption;
            // 两个 span，第二个的字体是第一个的 80%，颜色为灰色
            typeSpan.style.display = "block";
            typeTipSpan.style.display = "block";
            typeSpan.style.fontSize = "80%";
            typeSpan.style.color = "gray";
            div.appendChild(typeTipSpan);
            div.appendChild(typeSpan);
            el.appendChild(div);
        } else if (value.type === "sec") {
            // 如果 type 为 sec
            const div = document.createElement("div");
            // div 中有两个 span，一个显示类型，一个显示类型提示
            const typeSpan = document.createElement("span");
            // 如果value.label中包含|或-，剔除其后面的内容
            if (value.label.includes("|") || value.label.includes("-")) {
                typeSpan.textContent = "H"+value.label.slice(0, value.label.indexOf("|") > -1 ? value.label.indexOf("|") : value.label.indexOf("-"));
            }
            const typeTipDiv = document.createElement("div");
            // 在这个 Div 中有两个 span，一个显示标题层级，一个显示标题，标题层级和标题之间用|分割
            const lineIndex = value.caption.indexOf("|");
            const levelStr = value.caption.slice(0, lineIndex);
            const titleStr = value.caption.slice(lineIndex + 1, value.caption.length);
            const levelSpan = document.createElement("span");
            levelSpan.textContent = levelStr;
            const titleSpan = document.createElement("span");
            titleSpan.textContent = titleStr;
            // 给 levelSpan 设置一个淡灰色背景，圆角，字体为正常的 80%
            levelSpan.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
            levelSpan.style.borderRadius = "4px";
            levelSpan.style.fontSize = "60%";
            levelSpan.style.color = "gray";
            levelSpan.style.padding = "2px 4px";
            levelSpan.style.marginRight = "4px";
            levelSpan.style.display = "inline-block";
            // 同时 levelSpan要有一个最小宽度
            levelSpan.style.minWidth = "10px";
            typeTipDiv.appendChild(levelSpan);
            typeTipDiv.appendChild(titleSpan);
            typeSpan.style.display = "block";
            typeSpan.style.fontSize = "80%";
            typeSpan.style.color = "gray";
            div.appendChild(typeTipDiv);
            div.appendChild(typeSpan);
            el.appendChild(div);
        }
    }
    selectSuggestion(value: Reference, evt: MouseEvent | KeyboardEvent): void {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }
        const editor = view.editor;
        if (!editor) { 
            return;
        }
        // 如果value.type=type的话，在光标处插入value.caption的内容
        if (value.type === "type") {
            editor.replaceRange(value.caption + ":", editor.getCursor());
            // 光标向右移动value.caption的长度
            editor.setCursor(editor.getCursor().line, editor.getCursor().ch + value.caption.length + 1);
        } else if (value.type === "fig") {
            // 从当前光标位置往前找第一个:
            const colonIndex = editor.getLine(editor.getCursor().line).slice(0, editor.getCursor().ch).lastIndexOf(":");
            // 提取出:到当前光标位置的文本
            const leftStr = editor.getLine(editor.getCursor().line).slice(colonIndex + 1, editor.getCursor().ch);
            // 替换掉 leftStr
            editor.replaceRange(value.label, {
                line: editor.getCursor().line,
                ch: editor.getCursor().ch - leftStr.length
            }, editor.getCursor());
            if (leftStr.length == 0) {
                // 向右移动 value.label 的长度
                editor.setCursor(editor.getCursor().line, editor.getCursor().ch + value.label.length);
            }
        } else if (value.type === "tbl") {
            // 从当前光标位置往前找第一个:
            const colonIndex = editor.getLine(editor.getCursor().line).slice(0, editor.getCursor().ch).lastIndexOf(":");
            // 提取出:到当前光标位置的文本
            const leftStr = editor.getLine(editor.getCursor().line).slice(colonIndex + 1, editor.getCursor().ch);
            editor.replaceRange(value.label, {
                line: editor.getCursor().line,
                ch: editor.getCursor().ch - leftStr.length
            }, editor.getCursor());
            if (leftStr.length == 0) {
                // 向右移动 value.label 的长度
                editor.setCursor(editor.getCursor().line, editor.getCursor().ch + value.label.length);
            }
        } else if (value.type === "sec") { 
            const colonIndex = editor.getLine(editor.getCursor().line).slice(0, editor.getCursor().ch).lastIndexOf(":");
            // 提取出:到当前光标位置的文本
            const leftStr = editor.getLine(editor.getCursor().line).slice(colonIndex + 1, editor.getCursor().ch);
            // 如果 value.label中包含|，则直接插入|后面的内容作为引用
            let tagName = value.label.indexOf("|") > -1 ? value.label.substring(value.label.indexOf("|") + 1) : value.label;
            // 如果 value.label中包含-，则将-后面的内容视为行号
            const lineNumber = parseInt(value.label.indexOf("-") > -1 ? value.label.slice(value.label.indexOf("-") + 1, value.label.length) : "-1");
            if (lineNumber > 0) { 
                // 在行号所在行的结尾插入一个随机标签
                let secTagFormat = this.plugin.settings.secRefStyle;
                // 提取其中{tag:x}
                const tag = secTagFormat.match(/\{tag:(\d+)\}/)?.[1];
                // 如果tag为undefined，则生成一个随机字符
                let randomTag = "";
                if (!tag) {
                    randomTag = Math.random().toString(36).substring(2, 2 + 3);
                    // 替换{tag:x}为随机字符
                    secTagFormat = secTagFormat.replace(`{tag:${tag}}`, randomTag);
                } else {
                    // 生成对应长度的随机字符
                    randomTag = Math.random().toString(36).substring(2, 2 + parseInt(tag));
                    // 替换{tag:x}为随机字符
                    secTagFormat = secTagFormat.replace(`{tag:${tag}}`, randomTag);
                }
                secTagFormat = ` {#sec:${secTagFormat}}`;
                editor.replaceRange(secTagFormat, {
                    line: lineNumber,
                    ch: editor.getLine(lineNumber).length
                }, {
                    line: lineNumber,
                    ch: editor.getLine(lineNumber).length
                });
                tagName = randomTag;
            }
            editor.replaceRange(tagName, {
                line: editor.getCursor().line,
                ch: editor.getCursor().ch - leftStr.length
            }, editor.getCursor());
            if (leftStr.length == 0) {
                // 向右移动 value.label 的长度
                editor.setCursor(editor.getCursor().line, editor.getCursor().ch + tagName.length);
            }
        }
    }

}