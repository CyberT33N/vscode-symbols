import * as vscode from "vscode";
import pkgConfig from "../../package.json";
import defaultConfig from "../symbol-icon-theme.json";
import { PKG_PROP_MAP } from "./constants.js";
import { log } from "./log.js";
import { getSoureFile, writeThemeFile } from "./theme.js";
import { updateThemeJSONHandlers } from "./theme-json-handlers.js";

// get the configuration definition from the package.json
// and also the default state of the theme to act as fallback
// values for the configs
const configDef = pkgConfig.contributes.configuration;
const configKeys = Object.keys(configDef.properties);
const defaultState = themeJSONToConfig(defaultConfig);

/**
 * @description will get the current **workspace** configuration
 */
export function getWorkspaceConfiguration() {
	const config = {};
	for (const key of configKeys) {
		if (!PKG_PROP_MAP[key]) {
			continue;
		}

		const valueGroup = vscode.workspace.getConfiguration("symbols").inspect(PKG_PROP_MAP[key]);

		config[PKG_PROP_MAP[key]] = valueGroup.workspaceValue || valueGroup.globalValue || defaultState[PKG_PROP_MAP[key]];
	}

	return config;
}

/**
 * @description normalize a theme definition json to only have
 * keys that are defined in the configuration section of the package.json
 */
export function themeJSONToConfig(themeDef) {
	const result = {};

	for (const key of configKeys) {
		if (!PKG_PROP_MAP[key]) {
			continue;
		}
		result[PKG_PROP_MAP[key]] = themeDef[PKG_PROP_MAP[key]];
	}

	return result;
}

/**
 * @description update the changed property in the global settings and
 * in the theme definition file
 */
export function updateConfig(config) {
	const themeJSON = getSoureFile();

	const useDefaultAssociations = vscode.workspace.getConfiguration("symbols").get("defaultAssociations", true);
	log.info(`🤖 symbols.defaultAssociations changed, updating to ${useDefaultAssociations}`);
	if (useDefaultAssociations === false) {
		themeJSON.fileExtensions = {};
		themeJSON.fileNames = {};
		themeJSON.languageIds = {};
		themeJSON.folderNames = {};
	}

	for (const key in config) {
		log.info(`🤖 symbols.${key} changed, updating to ${config[key]}`);
		const updateHandler = updateThemeJSONHandlers[key];
		if (updateHandler) {
			updateHandler(themeJSON, config[key]);
		}
	}

	writeThemeFile(themeJSON);
}
