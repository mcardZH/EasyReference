import { i18n } from "./i18n";

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
            name: i18n.t("pandocConfig.figureTitle.name"),
            description: i18n.t("pandocConfig.figureTitle.description"),
            value: i18n.t("defaultPrefixes.figure"),
        },
        {
            pandocCrossrefConfigName: "tableTitle",
            name: i18n.t("pandocConfig.tableTitle.name"),
            description: i18n.t("pandocConfig.tableTitle.description"),
            value: i18n.t("defaultPrefixes.table"),
        },
        {
            pandocCrossrefConfigName: "subfigGrid",
            name: i18n.t("pandocConfig.subfigGrid.name"),
            description: i18n.t("pandocConfig.subfigGrid.description"),
            value: false,
        },
        {
            pandocCrossrefConfigName: "figPrefix",
            name: i18n.t("pandocConfig.figPrefix.name"),
            description: i18n.t("pandocConfig.figPrefix.description"),
            value: [i18n.t("defaultPrefixes.figure")],
        },
        {
            pandocCrossrefConfigName: "eqnPrefix",
            name: i18n.t("pandocConfig.eqnPrefix.name"),
            description: i18n.t("pandocConfig.eqnPrefix.description"),
            value: [i18n.t("defaultPrefixes.equation")],
        },
        {
            pandocCrossrefConfigName: "tblPrefix",
            name: i18n.t("pandocConfig.tblPrefix.name"),
            description: i18n.t("pandocConfig.tblPrefix.description"),
            value: [i18n.t("defaultPrefixes.table")],
        },
        {
            pandocCrossrefConfigName: "linkReferences",
            name: i18n.t("pandocConfig.linkReferences.name"),
            description: i18n.t("pandocConfig.linkReferences.description"),
            value: false,
        },
        {
            pandocCrossrefConfigName: "nameInLink",
            name: i18n.t("pandocConfig.nameInLink.name"),
            description: i18n.t("pandocConfig.nameInLink.description"),
            value: false,
        },
    ],
    additionStyle: "",


}
 
export { DEFAULT_SETTINGS };
export type { PluginSettings, PandocCrossrefSetting };