import { DEFAULT_SETTINGS, PandocCrossrefSetting } from "config";
import EasyReferencePlugin from "main";
import {
	App,
	Modal,
	Notice,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";
import * as yaml from "js-yaml";

class EasyInputModal extends Modal {
	config: PandocCrossrefSetting;
	settingTab: SettingTab;

	constructor(
		app: App,
		public plugin: EasyReferencePlugin,
		config: PandocCrossrefSetting,
		settingTab: SettingTab
	) {
		super(app);
		this.config = config;
		this.settingTab = settingTab;
	}

	onOpen() {
		const { contentEl } = this;
		let input: TextComponent;
		new Setting(contentEl).setName("新的前缀").addText((text) => {
			text.setPlaceholder("前缀");
			input = text;
		});
		new Setting(contentEl).addButton((button) => {
			button.onClick(async () => {
				if (typeof this.config.value === "object") {
					this.config.value.push(input.getValue());
				}
				await this.plugin.saveSettings();
				this.settingTab.display();
				this.close();
			});
			button.setButtonText("确定");
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SettingTab extends PluginSettingTab {
	plugin: EasyReferencePlugin;

	constructor(app: App, plugin: EasyReferencePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h4", {
			text: "使用说明",
		});
		containerEl.createEl("p", {
			text: "本插件需要配合Exhancing Export插件使用，同时需要安装pandoc、pandoc-crossref。可以与Image Converter配合使用",
		});
		containerEl.createEl("p", {
			text: "本插件提供了一系列命令便于使用，可以使用命令面板查看。",
		});
		containerEl.createEl("p", {
			text: "本插件的变量列表：",
		});
		const ul = containerEl.createEl("ul");
		const li1 = ul.createEl("li", { text: "{filename}：正在编辑的文件名，不含后缀" });
		const li2 = ul.createEl("li", { text: "{index}：自增编号，避免图片重复" });
		const li3 = ul.createEl("li", { text: "{ext}：图片后缀" });
		const li4 = ul.createEl("li", { text: "{tag:n}：生成一个 n 位随机字符" });
		ul.appendChild(li1);
		ul.appendChild(li2);
		ul.appendChild(li3);
		ul.appendChild(li4);
		containerEl.appendChild(ul);

		containerEl.createEl("h4", { text: "图片标签" });

		new Setting(containerEl).setName("图片标签格式")
			.setDesc("只支持{tag:n}变量")
			.addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.figRefStyle)
				.setValue(this.plugin.settings.figRefStyle)
				.onChange(async (value) => {
					this.plugin.settings.figRefStyle = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl)
			.setName("Markdown图片链接样式")
			.setDesc(
				"当启用时，将在插入图片时自动更改为Markdown图片链接样式（![alt](url)），只有 Markdown 格式的链接才能被pandoc-crossref处理。注意：如果同时使用image converter插件，建议停用本功能并在image converter 设置中启用类似设置项目。"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.markdownImageLinkStyle)
					.onChange(async (value) => {
						this.plugin.settings.markdownImageLinkStyle = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("保存图片名称格式")
			.setDesc(
				"当启用时，将在插入图片时自动更改为指定格式的图片名称。只在启用【Markdown图片链接样式】时生效。"
			)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.saveImageNameFormat)
					.setValue(this.plugin.settings.saveImageNameFormat)
					.onChange(async (value) => {
						this.plugin.settings.saveImageNameFormat = value;
						await this.plugin.saveSettings();
					})
		);
		
		new Setting(containerEl)
			.setName("使用简单路径")
			.setDesc("当启用时将使用不包含文件夹的路径的方式引用图片，否则将使用绝对路径。")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.relativePath)
					.onChange(async (value) => {
						this.plugin.settings.relativePath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("在所有文件中自动添加图片标签")
			.setDesc(
				"当启用时，在所有文件中插入图片时会自动添加图片标签；当禁用时，仅在添加文件属性`autoAddFigRef: true`时才会自动添加图片标签。"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoAddFigRef)
					.onChange(async (value) => {
						this.plugin.settings.autoAddFigRef = value;
						await this.plugin.saveSettings();
					})
			);

		// new Setting(containerEl)
		// 	.setName("渲染多图布局")
		// 	.setDesc("当启用时，将尝试渲染多图布局排版。")
		// 	.addToggle((toggle) =>
		// 		toggle
		// 			.setValue(this.plugin.settings.beautifyMultiImageLayout)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.beautifyMultiImageLayout = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);

		containerEl.createEl("h4", { text: "表格标签" });

		new Setting(containerEl).setName("表格标签格式").setDesc("只支持{tag:n}变量").addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.tblRefStyle)
				.setValue(this.plugin.settings.tblRefStyle)
				.onChange(async (value) => {
					this.plugin.settings.tblRefStyle = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl)
			.setName("在所有文件中自动添加表格标签")
			.setDesc(
				"当启用时，在所有文件中插入表格时会自动添加表格标签；当禁用时，仅在添加文件属性`autoAddTblRef: true`时才会自动添加表格标签。"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoAddTblRef)
					.onChange(async (value) => {
						this.plugin.settings.autoAddTblRef = value;
						await this.plugin.saveSettings();
					})
			);

		// containerEl.createEl("h4", { text: "公式标签" });

		// new Setting(containerEl).setName("公式标签格式").setDesc("只支持{tag:n}变量").addText((text) =>
		// 	text
		// 		.setPlaceholder(DEFAULT_SETTINGS.eqnRefStyle)
		// 		.setValue(this.plugin.settings.eqnRefStyle)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.eqnRefStyle = value;
		// 			await this.plugin.saveSettings();
		// 		})
		// );

		// new Setting(containerEl)
		// 	.setName("在所有文件中自动添加公式标签")
		// 	.setDesc(
		// 		"当启用时，在所有文件中插入公式时会自动添加公式标签；当禁用时，仅在添加文件属性`autoAddEqnRef: true`时才会自动添加公式标签。"
		// 	)
		// 	.addToggle((toggle) =>
		// 		toggle
		// 			.setValue(this.plugin.settings.autoAddEqnRef)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.autoAddEqnRef = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);

		containerEl.createEl("h4", { text: "章节标签" });

		new Setting(containerEl).setName("章节标签格式").setDesc("只支持{tag:n}变量").addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.secRefStyle)
				.setValue(this.plugin.settings.secRefStyle)
				.onChange(async (value) => {
					this.plugin.settings.secRefStyle = value;
					await this.plugin.saveSettings();
				})
		);

		containerEl.createEl("h4", { text: "引用格式" });
		containerEl.createEl("p", {
			text: "可以使用命令“更新frontmatter”来设置、更新当前打开文件的引用格式信息",
		});
		for (const config of this.plugin.settings.pandocCrossrefConfig) {
			const temp = new Setting(containerEl)
				.setName(config.name)
				.setDesc(config.description);
			if (typeof config.value === "string") {
				temp.addText((text) => {
					//@ts-ignore
					text.setValue(config.value);
					text.onChange(async (value) => {
						//@ts-ignore
						config.value = value;
						await this.plugin.saveSettings();
					});
				});
			} else if (typeof config.value === "boolean") {
				temp.addToggle((toggle) => {
					//@ts-ignore
					toggle.setValue(config.value);
					toggle.onChange(async (value) => {
						//@ts-ignore
						config.value = value;
						await this.plugin.saveSettings();
					});
				});
			} else {
				temp.addDropdown((dropdown) => {
					//@ts-ignore
					dropdown.addOptions(config.value);
				});
				temp.addExtraButton((button) => {
					button
						.setIcon("plus")
						.setTooltip("添加新的元素")
						.onClick(() => {
							new EasyInputModal(
								this.app,
								this.plugin,
								config,
								this
							).open();
						});
				});
				temp.addExtraButton((button) => {
					button
						.setIcon("trash")
						.setTooltip("删除当前元素")
						.onClick(() => {
							//@ts-ignore
							if (config.value.length === 1) {
								new Notice("无法删除最后一个元素", 2000);
								return;
							}
							//@ts-ignore
							config.value.pop();
							this.display();
						});
				});
			}
		}
		const additional = new Setting(containerEl)
			.setName("额外的引用格式模板")
			.setDesc(
				"参考：https://lierdakil.github.io/pandoc-crossref/#customization"
			)
			.addTextArea((text) =>
				text
					.setPlaceholder("请使用标准的 yaml 格式")
					.setValue(this.plugin.settings.additionStyle)
					.onChange(async (value) => {
						try {
							yaml.load(value);
							additional.setDesc(
								"参考：https://lierdakil.github.io/pandoc-crossref/#customization"
							);
							this.plugin.settings.additionStyle = value;
							await this.plugin.saveSettings();
						} catch (e) {
							additional.setDesc("YAML格式错误，请检查后重试");
						}
					})
			);
	}
}

export default SettingTab;
