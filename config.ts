interface PandocCrossrefSetting {
    pandocCrossrefConfigName: string;
    name: string;
    description: string;
    value: string | boolean | string[];
}

interface PluginSettings {
    figRefStyle: string;
    tblRefStyle: string;
    eqnRefStyle: string;
    secRefStyle: string;
    relativePath: boolean;
    autoAddFigRef: boolean;
    autoAddTblRef: boolean;
    autoAddEqnRef: boolean;
    beautifyMultiImageLayout: boolean;
    markdownImageLinkStyle: boolean;
    saveImageNameFormat: string;

    // pandoc-crossref常规选项
    pandocCrossrefConfig: PandocCrossrefSetting[];
    additionStyle: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
    figRefStyle: "fig{tag:3}", // tag:3 random 3 alphanumeric characters
    tblRefStyle: "tbl{tag:3}",
    eqnRefStyle: "eqn{tag:3}",
    secRefStyle: "sec{tag:3}",
    relativePath: false,
    autoAddFigRef: false,
    autoAddTblRef: false,
    autoAddEqnRef: false,
    beautifyMultiImageLayout: true,
    markdownImageLinkStyle: true,
    saveImageNameFormat: "{filename}-{index}.{ext}",
    
    // pandoc-crossref常规选项
    pandocCrossrefConfig: [
        {
            pandocCrossrefConfigName: "figureTitle",
            name: "图注前缀",
            description: "要添加到图表标题前面的单词，例如 Figure 1： Description",
            value: "图",
        },
        {
            pandocCrossrefConfigName: "tableTitle",
            name: "表注前缀",
            description: "要添加到表格标题前面的单词，例如 Table 1： Description",
            value: "表",
        },
        {
            pandocCrossrefConfigName: "subfigGrid",
            name: "用表格排版子图",
            description: "默认为 false。如果为 true，则在表中排版子图。对于 LaTeX 输出而被忽略。",
            value: false,
        },
        {
            pandocCrossrefConfigName: "figPrefix",
            name: "引用图前缀",
            description: "引用图的前缀，例如图 1-3",
            value: ["图"],
        },
        {
            pandocCrossrefConfigName: "eqnPrefix",
            name: "引用公式前缀",
            description: "式引用的前缀，例如式 3,4",
            value: ["式"],
        },
        {
            pandocCrossrefConfigName: "tblPrefix",
            name: "引用表前缀",
            description: "表引用的前缀，例如表 2",
            value: ["表"],
        },
        {
            pandocCrossrefConfigName: "linkReferences",
            name: "链接到被引用元素",
            description: "默认 false：创建指向被引用元素的引用超链接",
            value: false,
        },
        {
            pandocCrossrefConfigName: "nameInLink",
            name: "将标题包含在链接中",
            description: "对于单元素引用，将 prefix 包含在超链接中（使用“链接到被引用元素”时）",
            value: false,
        },
    ],
    additionStyle: "",


}
 
export { DEFAULT_SETTINGS };
export type { PluginSettings, PandocCrossrefSetting };