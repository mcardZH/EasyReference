import { Editor, MarkdownView } from "obsidian";
import EasyReferencePlugin from "main";

export class TableListener {
    private plugin: EasyReferencePlugin;

    constructor(plugin: EasyReferencePlugin) {
        this.plugin = plugin;
    }

    register() {
        // 注册编辑器更改事件
        this.plugin.registerEvent(
            this.plugin.app.workspace.on("editor-change", this.onChange.bind(this))
        );
    }

    private onChange(editor: Editor, view: MarkdownView) {

        

        // 获取当前光标所在行
        const cursor = editor.getCursor();
        const currentLine = editor.getLine(cursor.line);
        // 检查当前行是否是表格分隔符行（包含 | 和 -)
        if (this.isTableHeaderLine(currentLine)) {
            // 检查下一行是否是表格分隔符行
            if (cursor.line < editor.lineCount() - 1) {
                const nextLine = editor.getLine(cursor.line + 1);
                if (this.isTableSeparatorLine(nextLine)) {
                    // 发现新表格，处理表格标签
                    this.handleNewTable(editor, this.getTableLastLineNumber(editor, cursor.line));
                }
            }
        }
    }

    // 检查是否是表格分隔符行
    private isTableSeparatorLine(line: string): boolean {
        return /^\|?\s*[-:]+[-| :]*\|?\s*$/.test(line);
    }

    // 检查是否是表格标题行
    private isTableHeaderLine(line: string): boolean {
        return /^\|.+\|$/.test(line);
    }

    // 处理新表格
    private handleNewTable(editor: Editor, lastLineNum: number) {
        if (!this.shouldAddTableRef()) { 
            return;
        }
        // 判断一下是否为最后一行
        if (lastLineNum === editor.lineCount() - 1) { 
            // 在最后一行后面插入两个空行
            editor.replaceRange(`\n${this.generateTableTag()}\n`, {
                line: lastLineNum + 1,
                ch: 0
            });
            return;
        } else {
            // 检查表格最后一行的下一行是否满足正则表达式
            const nextLine = editor.getLine(lastLineNum + 1);
            if (!/:(.*?)\{#tbl:.*?\}$/.test(nextLine)) {
                // 在表格最后一行的下一行插入表格标签
                setTimeout(() => { 
                    editor.replaceRange(`${this.generateTableTag()}\n`, {
                        line: lastLineNum + 1,
                        ch: 0
                    });
                }, 10)
            }
        }
    }

    // 检查是否应该添加表格标签
    private shouldAddTableRef(): boolean {
        // 检查全局设置
        if (this.plugin.settings.autoAddTblRef) {
            return true;
        }

        // 检查当前文件的frontmatter
        const activeFile = this.plugin.app.workspace.getActiveFile();
        if (activeFile) {
            const frontmatter = this.plugin.app.metadataCache.getFileCache(activeFile)?.frontmatter;
            return frontmatter?.autoAddTblRef === true;
        }

        return false;
    }

    // 生成表格标签
    private generateTableTag(): string {
        let tagFormat = this.plugin.settings.tblRefStyle;
        // 提取{tag:x}中的x
        const tag = tagFormat.match(/\{tag:(\d+)\}/)?.[1];
        
        if (!tag) {
            // 如果没有指定长度，默认生成3个字符
            const randomTag = Math.random().toString(36).substring(2, 5);
            tagFormat = tagFormat.replace(/\{tag:\d*\}/, randomTag);
        } else {
            // 生成指定长度的随机字符
            const randomTag = Math.random().toString(36).substring(2, 2 + parseInt(tag));
            tagFormat = tagFormat.replace(`{tag:${tag}}`, randomTag);
        }

        return `: Caption {#tbl:${tagFormat}}`;
    }

    // 获取表格最后一行的行号
    getTableLastLineNumber(editor: Editor, startLine: number): number {
        let currentLine = startLine;
        
        // 向下遍历直到找到非表格行或文档结束
        while (currentLine < editor.lineCount()) {
            const line = editor.getLine(currentLine);
            // 检查是否是表格行（包含 | 符号）
            if (!line.includes('|')) {
                break;
            }
            currentLine++;
        }
        
        return currentLine - 1;
    }
}
