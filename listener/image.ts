import EasyReferencePlugin from "main";
import { App, Editor, MarkdownFileInfo, MarkdownView } from "obsidian";

export class ImageEventListener {
    private app: App;
    private plugin: EasyReferencePlugin;
    constructor(app: App, plugin: EasyReferencePlugin) {
        this.app = app;
        this.plugin = plugin;
        this.registerEvent();
    }

    private registerEvent() {
        this.plugin.registerEvent(
            this.app.workspace.on("editor-drop", this.dropEventHandler.bind(this))
        );
        this.plugin.registerEvent(
            this.app.workspace.on("editor-paste", this.pasteEventHandler.bind(this))
        );
    }

    /**
     * Triggered when the editor receives a drop event. 
     * Check for evt.defaultPrevented before attempting to handle this event, 
     * and return if it has been already handled. Use evt.preventDefault() to indicate 
     * that you've handled the event.
     */
    private async dropEventHandler(
        evt: DragEvent,
        editor: Editor,
        info: MarkdownView | MarkdownFileInfo
    ) {

        if (!evt) return;

        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) return; // no active file
        
        if (!this.plugin.settings.markdownImageLinkStyle) return; // if don't use markdown image link style, no do anything
        

        let autoAddFigRef = true;

        // 检查是否在添加文件属性`autoAddFigRef: true`时，自动添加图片标签
        if (!this.plugin.settings.autoAddFigRef) {
            // 读取 activeFile 的 frontmatter
            const frontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
            if (frontmatter) {
                // 检查 frontmatter 中是否存在 autoAddFigRef 属性
                if (frontmatter.autoAddFigRef) {
                    autoAddFigRef = true;
                } else {
                    autoAddFigRef = false;
                }
            } else {
                autoAddFigRef = false;
            }
        }

        setTimeout(() => {
            // 获取整个文档中的图片链接。通过正则表达式获取图片链接
            const wikiLinkRegex = /!\[\[(.*?)\]\]/;
            // 匹配markdown格式的图片时，需要考虑后面是不是已经存在图片标签，但是后面那个是可选的
            const markdownImageLinkRegex = /!\[(.*?)\]\((.*?)\)/;
            const markdownImageLinkWithTagRegex = /!\[(.*?)\]\((.*?)\){#fig:.*?}/;

            // 生成随机标签
            let imageTagFormat = this.plugin.settings.figRefStyle;
            // 提取其中{tag:x}
            const tag = imageTagFormat.match(/\{tag:(\d+)\}/)?.[1];
            // 如果tag为undefined，则生成一个随机字符
            if (!tag) {
                const randomTag = Math.random().toString(36).substring(2, 2 + 3);
                // 替换{tag:x}为随机字符
                imageTagFormat = imageTagFormat.replace(`{tag:${tag}}`, randomTag);
            } else {
                // 生成对应长度的随机字符
                const randomTag = Math.random().toString(36).substring(2, 2 + parseInt(tag));
                // 替换{tag:x}为随机字符
                imageTagFormat = imageTagFormat.replace(`{tag:${tag}}`, randomTag);
            }
            imageTagFormat = `{#fig:${imageTagFormat}}`;
            if (!autoAddFigRef) { 
                imageTagFormat = "";
            }
            // 对每一行进行匹配
            for (let i = 0; i < editor.lineCount(); i++) {
                const line = editor.getLine(i);
                const wikiLinkMatch = line.match(wikiLinkRegex);
                const markdownImageLinkMatch = line.match(markdownImageLinkRegex);
                const markdownImageLinkWithTagMatch = line.match(markdownImageLinkWithTagRegex);
                if (wikiLinkMatch) {
                    // 如果 wikiLink 中存在 |，则|前面是图片链接，后面是图片描述
                    if (wikiLinkMatch[1].includes("|")) {
                        const [link, description] = wikiLinkMatch[1].split("|");
                        // 将当前行修改为 markdown 图片链接
                        editor.setLine(i, `![${description}](${link})${imageTagFormat}`);
                    } else {
                        // 将当前行修改为 markdown 图片链接
                        editor.setLine(i, `![](${wikiLinkMatch[1]})${imageTagFormat}`);
                    }
                } else if (markdownImageLinkMatch) { 
                    if (markdownImageLinkWithTagMatch) {
                        continue; // 如果存在{#fig:x}，则不进行修改
                    } else {
                        // 将当前行修改为 markdown 图片链接
                        editor.setLine(i, `![${markdownImageLinkMatch[1]}](${markdownImageLinkMatch[2]})${imageTagFormat}`);
                    }
                }
                
            }
            
        }, 100);
    }
    
    /**
     * Triggered when the editor receives a paste event. 
     * Check for evt.defaultPrevented before attempting to handle this event, 
     * and return if it has been already handled. Use evt.preventDefault() to indicate 
     * that you've handled the event.
     */
    private async pasteEventHandler(
        evt: ClipboardEvent,
        editor: Editor,
        info: MarkdownView | MarkdownFileInfo
    ) {
        if (!evt) return;

        // check if the clipboard contains an image
        const items = evt.clipboardData?.items;
        if (!items) return;

        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) return; // no active file
        
        const cursor = editor.getCursor();
        if (cursor.ch !== 0) return;

        const itemData: { kind: string, type: string, file: File | null }[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === "file" && item.type.indexOf("image/") !== -1) {
                itemData.push({
                    kind: item.kind,
                    type: item.type,
                    file: item.getAsFile()
                });
            }
        }

        if (itemData.length === 0) return; // no image data in clipboard

        if (!this.plugin.settings.markdownImageLinkStyle) return; // if don't use markdown image link style, no do anything
        
        let useImageConverterPlugin = false;

        // if can use app.plugins api, use it to check if "image-converter" plugin is enabled
        // @ts-ignore
        if (this.app.plugins) {
            // @ts-ignore
            useImageConverterPlugin = this.app.plugins.enabledPlugins.has("image-converter");
        }

        let autoAddFigRef = true;

        // 检查是否在添加文件属性`autoAddFigRef: true`时，自动添加图片标签
        if (this.plugin.settings.autoAddFigRef) {
            // 读取 activeFile 的 frontmatter
            const frontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
            if (frontmatter) {
                // 检查 frontmatter 中是否存在 autoAddFigRef 属性
                if (frontmatter.autoAddFigRef) {
                    autoAddFigRef = true;
                } else {
                    autoAddFigRef = false;
                }
            } else {
                autoAddFigRef = false;
            }
        }

        // if "image-converter" plugin is enabled, update all images links which in active editor
        // else, directly update current image link

        if (useImageConverterPlugin) {
            // 当使用 image-converter 插件时，延迟 5000ms 后寻找整个文档中的图片链接，并更新为 markdown 图片链接
            setTimeout(() => {
                // 获取整个文档中的图片链接。通过正则表达式获取图片链接
                const wikiLinkRegex = /!\[\[(.*?)\]\]/;
                // 匹配markdown格式的图片时，需要考虑后面是不是已经存在图片标签，但是后面那个是可选的
                const markdownImageLinkRegex = /!\[(.*?)\]\((.*?)\)/;
                const markdownImageLinkWithTagRegex = /!\[(.*?)\]\((.*?)\){#fig:.*?}/;

                // 生成随机标签
                let imageTagFormat = this.plugin.settings.figRefStyle;
                // 提取其中{tag:x}
                const tag = imageTagFormat.match(/\{tag:(\d+)\}/)?.[1];
                // 如果tag为undefined，则生成一个随机字符
                if (!tag) {
                    const randomTag = Math.random().toString(36).substring(2, 2 + 3);
                    // 替换{tag:x}为随机字符
                    imageTagFormat = imageTagFormat.replace(`{tag:${tag}}`, randomTag);
                } else {
                    // 生成对应长度的随机字符
                    const randomTag = Math.random().toString(36).substring(2, 2 + parseInt(tag));
                    // 替换{tag:x}为随机字符
                    imageTagFormat = imageTagFormat.replace(`{tag:${tag}}`, randomTag);
                }
                imageTagFormat = `{#fig:${imageTagFormat}}`;
                if (!autoAddFigRef) { 
                    imageTagFormat = "";
                }
                // 对每一行进行匹配
                for (let i = 0; i < editor.lineCount(); i++) {
                    const line = editor.getLine(i);
                    const wikiLinkMatch = line.match(wikiLinkRegex);
                    const markdownImageLinkMatch = line.match(markdownImageLinkRegex);
                    const markdownImageLinkWithTagMatch = line.match(markdownImageLinkWithTagRegex);
                    if (wikiLinkMatch) {
                        // 如果 wikiLink 中存在 |，则|前面是图片链接，后面是图片描述
                        if (wikiLinkMatch[1].includes("|")) {
                            const [link, description] = wikiLinkMatch[1].split("|");
                            // 将当前行修改为 markdown 图片链接
                            editor.setLine(i, `![${description}](${link})${imageTagFormat}`);
                        } else {
                            // 将当前行修改为 markdown 图片链接
                            editor.setLine(i, `![](${wikiLinkMatch[1]})${imageTagFormat}`);
                        }
                    } else if (markdownImageLinkMatch) { 
                        if (markdownImageLinkWithTagMatch) {
                            continue; // 如果存在{#fig:x}，则不进行修改
                        } else {
                            // 将当前行修改为 markdown 图片链接
                            editor.setLine(i, `![${markdownImageLinkMatch[1]}](${markdownImageLinkMatch[2]})${imageTagFormat}`);
                        }
                    }
                    
                }
                
            }, 3000);
        } else {
            // update current image link
            evt.preventDefault(); // prevent default paste event
            for (let i = 0; i < itemData.length; i++) {
                const item = itemData[i];
                if (item.file) {
                    // 获取 Obsidian 图片资源保存位置的相关设置
                    // @ts-ignore
                    const basePath = this.app.vault.getConfig("attachmentFolderPath");
                    
                    // 构建图片保存路径
                    let savePath = "";
                    if (basePath) {
                        // 如果设置了附件文件夹
                        if (basePath.startsWith("./")) {
                            // 相对路径
                            savePath = basePath.slice(2);
                        } else if (basePath === "./") {
                            // 当前文件夹
                            savePath = "";
                        } else {
                            // 绝对路径
                            savePath = basePath;
                        }
                    }
                    let fileName = this.plugin.settings.saveImageNameFormat;
                    // 替换变量{filename}为当前编辑中的文件名，不包括后缀
                    fileName = fileName.replace("{filename}", activeFile.name.split(".")[0]);
                    // 替换变量{rawName}为图片文件的原始名称
                    fileName = fileName.replace("{rawName}", item.file.name);
                    // 替换变量{ext}为图片文件的扩展名
                    fileName = fileName.replace("{ext}", item.file.name.split(".")[1]);
                    // {index}从 1 开始检查，直到找到一个不存在的文件名
                    let index = 1;
                    let flag = true
                    while (flag) {
                        const fileName2 = fileName.replace("{index}", index.toString());
                        index++;
                        if (!this.app.vault.getAbstractFileByPath(`${savePath}/${fileName2}`)) {
                            fileName = fileName2;
                            flag = false;
                            break;
                        }
                        
                    }
                    // 保存图片
                    const fullPath = savePath ? `${savePath}/${fileName}` : fileName;
                    // 首先要将 file 转为 arrayBuffer
                    const buffer = await item.file.arrayBuffer();
                    // 使用createBinary方法保存图片
                    const tFile = await this.app.vault.createBinary(fullPath, buffer);
                    // 读取图片标签格式配置
                    let imageTagFormat = this.plugin.settings.figRefStyle;
                    // 提取其中{tag:x}
                    const tag = imageTagFormat.match(/\{tag:(\d+)\}/)?.[1];
                    // 如果tag为undefined，则生成一个随机字符
                    if (!tag) {
                        const randomTag = Math.random().toString(36).substring(2, 2 + 3);
                        // 替换{tag:x}为随机字符
                        imageTagFormat = imageTagFormat.replace(`{tag:${tag}}`, randomTag);
                    } else {
                        // 生成对应长度的随机字符
                        const randomTag = Math.random().toString(36).substring(2, 2 + parseInt(tag));
                        // 替换{tag:x}为随机字符
                        imageTagFormat = imageTagFormat.replace(`{tag:${tag}}`, randomTag);
                    }
                    imageTagFormat = `{#fig:${imageTagFormat}}`;
                    if (!autoAddFigRef) { 
                        imageTagFormat = "";
                    }
                    // 如果使用相对路径，则使用相对路径的方式引用图片
                    if (this.plugin.settings.relativePath) {
                        // 替换图片链接
                        const imageLink = `![](${tFile.name})${imageTagFormat}`;
                        // 在光标位置插入图片链接
                        editor.replaceRange(imageLink, cursor);
                        // 光标移动到图片的后面
                        editor.setCursor(cursor.line, cursor.ch + imageLink.length);
                    } else {
                        // 替换图片链接
                        const imageLink = `![](${fullPath})${imageTagFormat}`;
                        // 在光标位置插入图片链接
                        editor.replaceRange(imageLink, cursor);
                        // 光标移动到图片的后面
                        editor.setCursor(cursor.line, cursor.ch + imageLink.length);
                    }
                    
                }
            }
            // insertImageAtCursorPosition(editor, itemData[0].file, cursor, this.plugin.settings.markdownImageLinkStyle);
        }

    }
    
}
