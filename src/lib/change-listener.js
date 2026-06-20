import { getWorkspaceConfiguration, themeJSONToConfig, updateConfig } from "./config.js";
import { getThemeFile } from "./theme.js";

export function monitorConfigChanges() {
	const themeJSON = getThemeFile();
	const currentState = themeJSONToConfig(themeJSON);
	const workspaceState = getWorkspaceConfiguration();

	const updatedKeys = {};

	for (const currentKey in currentState) {
		updatedKeys[currentKey] = workspaceState[currentKey];
	}

	updateConfig(updatedKeys);
}
