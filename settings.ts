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
import { i18n } from "i18n";

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
		new Setting(contentEl).setName(i18n.t("settings.modal.newPrefixLabel")).addText((text) => {
			text.setPlaceholder(i18n.t("settings.modal.prefixPlaceholder"));
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
			button.setButtonText(i18n.t("settings.modal.confirmButton"));
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
			text: i18n.t("settings.usage.title"),
		});
		containerEl.createEl("p", {
			text: i18n.t("settings.usage.description"),
		});
		containerEl.createEl("p", {
			text: i18n.t("settings.usage.commandDescription"),
		});
		containerEl.createEl("p", {
			text: i18n.t("settings.usage.variableListTitle"),
		});
		const ul = containerEl.createEl("ul");
		const li1 = ul.createEl("li", { text: i18n.t("settings.usage.variables.filename") });
		const li2 = ul.createEl("li", { text: i18n.t("settings.usage.variables.index") });
		const li3 = ul.createEl("li", { text: i18n.t("settings.usage.variables.ext") });
		const li4 = ul.createEl("li", { text: i18n.t("settings.usage.variables.tagN") });
		ul.appendChild(li1);
		ul.appendChild(li2);
		ul.appendChild(li3);
		ul.appendChild(li4);
		containerEl.appendChild(ul);

		containerEl.createEl("h4", { text: i18n.t("settings.figureSettings.title") });

		new Setting(containerEl).setName(i18n.t("settings.figureSettings.formatLabel"))
			.setDesc(i18n.t("settings.figureSettings.formatDescription"))
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
			.setName(i18n.t("settings.figureSettings.markdownLinkLabel"))
			.setDesc(i18n.t("settings.figureSettings.markdownLinkDescription"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.markdownImageLinkStyle)
					.onChange(async (value) => {
						this.plugin.settings.markdownImageLinkStyle = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(i18n.t("settings.figureSettings.saveNameFormatLabel"))
			.setDesc(i18n.t("settings.figureSettings.saveNameFormatDescription"))
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
			.setName(i18n.t("settings.figureSettings.relativePathLabel"))
			.setDesc(i18n.t("settings.figureSettings.relativePathDescription"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.relativePath)
					.onChange(async (value) => {
						this.plugin.settings.relativePath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(i18n.t("settings.figureSettings.autoAddLabel"))
			.setDesc(i18n.t("settings.figureSettings.autoAddDescription"))
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

		containerEl.createEl("h4", { text: i18n.t("settings.tableSettings.title") });

		new Setting(containerEl).setName(i18n.t("settings.tableSettings.formatLabel")).setDesc(i18n.t("settings.tableSettings.formatDescription")).addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.tblRefStyle)
				.setValue(this.plugin.settings.tblRefStyle)
				.onChange(async (value) => {
					this.plugin.settings.tblRefStyle = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl)
			.setName(i18n.t("settings.tableSettings.autoAddLabel"))
			.setDesc(i18n.t("settings.tableSettings.autoAddDescription"))
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

		containerEl.createEl("h4", { text: i18n.t("settings.sectionSettings.title") });

		new Setting(containerEl).setName(i18n.t("settings.sectionSettings.formatLabel")).setDesc(i18n.t("settings.sectionSettings.formatDescription")).addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.secRefStyle)
				.setValue(this.plugin.settings.secRefStyle)
				.onChange(async (value) => {
					this.plugin.settings.secRefStyle = value;
					await this.plugin.saveSettings();
				})
		);

		containerEl.createEl("h4", { text: i18n.t("settings.referenceSettings.title") });
		containerEl.createEl("p", {
			text: i18n.t("settings.referenceSettings.frontmatterDescription"),
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
						.setTooltip(i18n.t("settings.modal.addElementTooltip"))
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
						.setTooltip(i18n.t("settings.modal.deleteElementTooltip"))
						.onClick(() => {
							//@ts-ignore
							if (config.value.length === 1) {
								new Notice(i18n.t("settings.modal.cannotDeleteLastElement"), 2000);
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
			.setName(i18n.t("settings.referenceSettings.additionalTemplateLabel"))
			.setDesc(i18n.t("settings.referenceSettings.additionalTemplateDescription"))
			.addTextArea((text) =>
				text
					.setPlaceholder(i18n.t("settings.referenceSettings.additionalTemplatePlaceholder"))
					.setValue(this.plugin.settings.additionStyle)
					.onChange(async (value) => {
						try {
							yaml.load(value);
							additional.setDesc(i18n.t("settings.referenceSettings.additionalTemplateDescription"));
							this.plugin.settings.additionStyle = value;
							await this.plugin.saveSettings();
						} catch (e) {
							additional.setDesc(i18n.t("settings.referenceSettings.yamlFormatError"));
						}
					})
			);
	}
}

export default SettingTab;
