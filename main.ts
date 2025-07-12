import { Plugin } from "obsidian";

import { PluginSettings, DEFAULT_SETTINGS } from "./config";
import SettingTab from "settings";
import {ImageEventListener} from "listener/image";
import { ReferenceSuggest } from "suggest";
import { TableListener } from "listener/table";
import * as yaml from "js-yaml";
import { i18n } from "i18n";


export default class EasyReferencePlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;

		new ImageEventListener(this.app, this);
		new TableListener(this).register();

		this.addSettingTab(new SettingTab(this.app, this));

		this.registerEditorSuggest(new ReferenceSuggest(this.app, this));
		

		this.addCommand({
			id: "easy-reference-update-frontmatter",
			repeatable: false,
			name: i18n.t("commands.updateFrontmatter"),
			editorCallback(editor, ctx) {

				//@ts-ignore
				self.app.fileManager.processFrontMatter(ctx.file, (frontmatter) => {
					const crossrefConfig = self.settings.pandocCrossrefConfig;
					const additionCrossrefConfig = yaml.load(self.settings.additionStyle, { json: true});
					for (const config of crossrefConfig) {
						// 将crossrefConfig中的value值写入frontmatter中
						frontmatter[config.pandocCrossrefConfigName] = config.value;
					}
					if (additionCrossrefConfig) { 
						console.log(additionCrossrefConfig);
						//@ts-ignore
						for (const key in additionCrossrefConfig) {
							//@ts-ignore
							frontmatter[key] = additionCrossrefConfig[key];
						}
					}
				});
				
			},
		})

	}

	onunload() {

		
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

