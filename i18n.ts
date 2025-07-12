import { moment } from "obsidian";

// 语言类型定义
export type Language = "zh" | "en";

// 翻译文本接口
export interface TranslationMap {
    // 设置页面
    settings: {
        title: string;
        usage: {
            title: string;
            description: string;
            commandDescription: string;
            variableListTitle: string;
            variables: {
                filename: string;
                index: string;
                ext: string;
                tagN: string;
            };
        };
        
        // 图片标签设置
        figureSettings: {
            title: string;
            formatLabel: string;
            formatDescription: string;
            markdownLinkLabel: string;
            markdownLinkDescription: string;
            saveNameFormatLabel: string;
            saveNameFormatDescription: string;
            relativePathLabel: string;
            relativePathDescription: string;
            autoAddLabel: string;
            autoAddDescription: string;
        };
        
        // 表格标签设置
        tableSettings: {
            title: string;
            formatLabel: string;
            formatDescription: string;
            autoAddLabel: string;
            autoAddDescription: string;
        };
        
        // 章节标签设置
        sectionSettings: {
            title: string;
            formatLabel: string;
            formatDescription: string;
        };
        
        // 引用格式设置
        referenceSettings: {
            title: string;
            description: string;
            frontmatterDescription: string;
            additionalTemplateLabel: string;
            additionalTemplateDescription: string;
            additionalTemplatePlaceholder: string;
            yamlFormatError: string;
        };
        
        // 模态框
        modal: {
            newPrefixLabel: string;
            prefixPlaceholder: string;
            confirmButton: string;
            addElementTooltip: string;
            deleteElementTooltip: string;
            cannotDeleteLastElement: string;
        };
    };
    
    // 命令
    commands: {
        updateFrontmatter: string;
    };
    
    // 引用类型
    referenceTypes: {
        fig: string;
        tbl: string;
        sec: string;
    };
    
    // Pandoc配置
    pandocConfig: {
        figureTitle: {
            name: string;
            description: string;
        };
        tableTitle: {
            name: string;
            description: string;
        };
        subfigGrid: {
            name: string;
            description: string;
        };
        figPrefix: {
            name: string;
            description: string;
        };
        eqnPrefix: {
            name: string;
            description: string;
        };
        tblPrefix: {
            name: string;
            description: string;
        };
        linkReferences: {
            name: string;
            description: string;
        };
        nameInLink: {
            name: string;
            description: string;
        };
    };
    
    // 默认前缀值
    defaultPrefixes: {
        figure: string;
        table: string;
        equation: string;
    };
}

// 中文翻译
const zhTranslations: TranslationMap = {
    settings: {
        title: "使用说明",
        usage: {
            title: "使用说明",
            description: "本插件需要配合Enhancing Export插件使用，同时需要安装pandoc、pandoc-crossref。可以与Image Converter配合使用",
            commandDescription: "本插件提供了一系列命令便于使用，可以使用命令面板查看。",
            variableListTitle: "本插件的变量列表：",
            variables: {
                filename: "{filename}：正在编辑的文件名，不含后缀",
                index: "{index}：自增编号，避免图片重复",
                ext: "{ext}：图片后缀",
                tagN: "{tag:n}：生成一个 n 位随机字符"
            }
        },
        figureSettings: {
            title: "图片标签",
            formatLabel: "图片标签格式",
            formatDescription: "只支持{tag:n}变量",
            markdownLinkLabel: "Markdown图片链接样式",
            markdownLinkDescription: "当启用时，将在插入图片时自动更改为Markdown图片链接样式（![alt](url)），只有 Markdown 格式的链接才能被pandoc-crossref处理。注意：如果同时使用image converter插件，建议停用本功能并在image converter 设置中启用类似设置项目。",
            saveNameFormatLabel: "保存图片名称格式",
            saveNameFormatDescription: "当启用时，将在插入图片时自动更改为指定格式的图片名称。只在启用【Markdown图片链接样式】时生效。",
            relativePathLabel: "使用简单路径",
            relativePathDescription: "当启用时将使用不包含文件夹的路径的方式引用图片，否则将使用绝对路径。",
            autoAddLabel: "在所有文件中自动添加图片标签",
            autoAddDescription: "当启用时，在所有文件中插入图片时会自动添加图片标签；当禁用时，仅在添加文件属性`autoAddFigRef: true`时才会自动添加图片标签。"
        },
        tableSettings: {
            title: "表格标签",
            formatLabel: "表格标签格式",
            formatDescription: "只支持{tag:n}变量",
            autoAddLabel: "在所有文件中自动添加表格标签",
            autoAddDescription: "当启用时，在所有文件中插入表格时会自动添加表格标签；当禁用时，仅在添加文件属性`autoAddTblRef: true`时才会自动添加表格标签。"
        },
        sectionSettings: {
            title: "章节标签",
            formatLabel: "章节标签格式",
            formatDescription: "只支持{tag:n}变量"
        },
        referenceSettings: {
            title: "引用格式",
            description: "可以使用命令\"更新frontmatter\"来设置、更新当前打开文件的引用格式信息",
            frontmatterDescription: "可以使用命令\"更新frontmatter\"来设置、更新当前打开文件的引用格式信息",
            additionalTemplateLabel: "额外的引用格式模板",
            additionalTemplateDescription: "参考：https://lierdakil.github.io/pandoc-crossref/#customization",
            additionalTemplatePlaceholder: "请使用标准的 yaml 格式",
            yamlFormatError: "YAML格式错误，请检查后重试"
        },
        modal: {
            newPrefixLabel: "新的前缀",
            prefixPlaceholder: "前缀",
            confirmButton: "确定",
            addElementTooltip: "添加新的元素",
            deleteElementTooltip: "删除当前元素",
            cannotDeleteLastElement: "无法删除最后一个元素"
        }
    },
    commands: {
        updateFrontmatter: "更新frontmatter"
    },
    referenceTypes: {
        fig: "图",
        tbl: "表",
        sec: "章节"
    },
    pandocConfig: {
        figureTitle: {
            name: "图注前缀",
            description: "要添加到图表标题前面的单词，例如 Figure 1： Description"
        },
        tableTitle: {
            name: "表注前缀",
            description: "要添加到表格标题前面的单词，例如 Table 1： Description"
        },
        subfigGrid: {
            name: "用表格排版子图",
            description: "默认为 false。如果为 true，则在表中排版子图。对于 LaTeX 输出而被忽略。"
        },
        figPrefix: {
            name: "引用图前缀",
            description: "引用图的前缀，例如图 1-3"
        },
        eqnPrefix: {
            name: "引用公式前缀",
            description: "式引用的前缀，例如式 3,4"
        },
        tblPrefix: {
            name: "引用表前缀",
            description: "表引用的前缀，例如表 2"
        },
        linkReferences: {
            name: "链接到被引用元素",
            description: "默认 false：创建指向被引用元素的引用超链接"
        },
        nameInLink: {
            name: "将标题包含在链接中",
            description: "对于单元素引用，将 prefix 包含在超链接中（使用\"链接到被引用元素\"时）"
        }
    },
    defaultPrefixes: {
        figure: "图",
        table: "表",
        equation: "式"
    }
};

// 英文翻译
const enTranslations: TranslationMap = {
    settings: {
        title: "Usage Instructions",
        usage: {
            title: "Usage Instructions",
            description: "This plugin requires the Enhancing Export plugin and pandoc, pandoc-crossref to be installed. It can be used with Image Converter plugin.",
            commandDescription: "This plugin provides a series of commands for easy use. You can view them in the command palette.",
            variableListTitle: "Available variables in this plugin:",
            variables: {
                filename: "{filename}: Name of the file being edited, without extension",
                index: "{index}: Auto-incrementing number to avoid image duplication",
                ext: "{ext}: Image file extension",
                tagN: "{tag:n}: Generate n random characters"
            }
        },
        figureSettings: {
            title: "Figure Labels",
            formatLabel: "Figure Label Format",
            formatDescription: "Only supports {tag:n} variable",
            markdownLinkLabel: "Markdown Image Link Style",
            markdownLinkDescription: "When enabled, automatically converts to Markdown image link style (![alt](url)) when inserting images. Only Markdown format links can be processed by pandoc-crossref. Note: If using image converter plugin simultaneously, it's recommended to disable this feature and enable similar settings in image converter plugin.",
            saveNameFormatLabel: "Save Image Name Format",
            saveNameFormatDescription: "When enabled, automatically changes to specified format image names when inserting images. Only effective when 【Markdown Image Link Style】 is enabled.",
            relativePathLabel: "Use Simple Path",
            relativePathDescription: "When enabled, uses paths without folders to reference images, otherwise uses absolute paths.",
            autoAddLabel: "Auto-add Figure Labels in All Files",
            autoAddDescription: "When enabled, automatically adds figure labels when inserting images in all files; when disabled, only adds labels when file property `autoAddFigRef: true` is set."
        },
        tableSettings: {
            title: "Table Labels",
            formatLabel: "Table Label Format",
            formatDescription: "Only supports {tag:n} variable",
            autoAddLabel: "Auto-add Table Labels in All Files",
            autoAddDescription: "When enabled, automatically adds table labels when inserting tables in all files; when disabled, only adds labels when file property `autoAddTblRef: true` is set."
        },
        sectionSettings: {
            title: "Section Labels",
            formatLabel: "Section Label Format",
            formatDescription: "Only supports {tag:n} variable"
        },
        referenceSettings: {
            title: "Reference Format",
            description: "You can use the \"Update Frontmatter\" command to set and update reference format information for the currently open file",
            frontmatterDescription: "You can use the \"Update Frontmatter\" command to set and update reference format information for the currently open file",
            additionalTemplateLabel: "Additional Reference Format Template",
            additionalTemplateDescription: "Reference: https://lierdakil.github.io/pandoc-crossref/#customization",
            additionalTemplatePlaceholder: "Please use standard YAML format",
            yamlFormatError: "YAML format error, please check and retry"
        },
        modal: {
            newPrefixLabel: "New Prefix",
            prefixPlaceholder: "Prefix",
            confirmButton: "Confirm",
            addElementTooltip: "Add new element",
            deleteElementTooltip: "Delete current element",
            cannotDeleteLastElement: "Cannot delete the last element"
        }
    },
    commands: {
        updateFrontmatter: "Update Frontmatter"
    },
    referenceTypes: {
        fig: "Figure",
        tbl: "Table",
        sec: "Section"
    },
    pandocConfig: {
        figureTitle: {
            name: "Figure Title Prefix",
            description: "Word to be added before figure titles, e.g., Figure 1: Description"
        },
        tableTitle: {
            name: "Table Title Prefix",
            description: "Word to be added before table titles, e.g., Table 1: Description"
        },
        subfigGrid: {
            name: "Subfigure Grid Layout",
            description: "Default is false. If true, subfigures are laid out in a table. Ignored for LaTeX output."
        },
        figPrefix: {
            name: "Figure Reference Prefix",
            description: "Prefix for figure references, e.g., Figure 1-3"
        },
        eqnPrefix: {
            name: "Equation Reference Prefix",
            description: "Prefix for equation references, e.g., Eq. 3,4"
        },
        tblPrefix: {
            name: "Table Reference Prefix",
            description: "Prefix for table references, e.g., Table 2"
        },
        linkReferences: {
            name: "Link to Referenced Elements",
            description: "Default false: Create hyperlinks to referenced elements"
        },
        nameInLink: {
            name: "Include Title in Link",
            description: "For single element references, include prefix in hyperlink (when using \"Link to Referenced Elements\")"
        }
    },
    defaultPrefixes: {
        figure: "Figure",
        table: "Table",
        equation: "Eq."
    }
};

// 国际化类
export class I18n {
    private language: Language;
    private translations: Record<Language, TranslationMap>;
    
    constructor() {
        this.translations = {
            zh: zhTranslations,
            en: enTranslations
        };
        
        // 获取用户语言设置
        this.language = this.detectLanguage();
    }
    
    /**
     * 检测用户语言
     */
    private detectLanguage(): Language {
        try {
            // 使用 Obsidian API 获取用户语言
            const obsidianLang = (window as any).app?.vault?.getConfig?.("language") || 
                                moment.locale() || 
                                navigator.language;
            
            // 如果是中文相关的语言代码，返回中文
            if (obsidianLang.startsWith("zh")) {
                return "zh";
            }
            
            // 默认返回英文
            return "en";
        } catch (error) {
            console.warn("Failed to detect language, using English as default:", error);
            return "en";
        }
    }
    
    /**
     * 设置语言
     */
    setLanguage(lang: Language): void {
        this.language = lang;
    }
    
    /**
     * 获取当前语言
     */
    getLanguage(): Language {
        return this.language;
    }
    
    /**
     * 获取翻译文本
     */
    t(key: string): string {
        const keys = key.split(".");
        let value: any = this.translations[this.language];
        
        // 遍历键路径
        for (const k of keys) {
            if (value && typeof value === "object" && k in value) {
                value = value[k];
            } else {
                // 如果当前语言没有找到，尝试英文作为回退
                if (this.language !== "en") {
                    let fallbackValue: any = this.translations.en;
                    for (const fk of keys) {
                        if (fallbackValue && typeof fallbackValue === "object" && fk in fallbackValue) {
                            fallbackValue = fallbackValue[fk];
                        } else {
                            fallbackValue = null;
                            break;
                        }
                    }
                    if (fallbackValue && typeof fallbackValue === "string") {
                        return fallbackValue;
                    }
                }
                
                // 如果都没找到，返回键本身
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        
        return typeof value === "string" ? value : key;
    }
    
    /**
     * 检查是否支持某个语言
     */
    isLanguageSupported(lang: string): boolean {
        return lang in this.translations;
    }
    
    /**
     * 获取所有支持的语言
     */
    getSupportedLanguages(): Language[] {
        return Object.keys(this.translations) as Language[];
    }
}

// 创建全局实例
export const i18n = new I18n(); 