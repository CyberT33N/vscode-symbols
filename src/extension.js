import * as vscode from "vscode";
import { monitorConfigChanges } from "./lib/change-listener.js";
import { log } from "./lib/log.js";
import { initializeThemeRuntimeRoot, syncOriginal } from "./lib/theme.js";
/**
 * @param {vscode.ExtensionContext} context
 */
export async function activate(context) {
	initializeThemeRuntimeRoot(context.extensionPath);
	log.info("miguelsolorio.symbols activated");
	await syncOriginal();
	monitorConfigChanges();

	vscode.workspace.onDidChangeConfiguration(monitorConfigChanges);
}

export function deactivate() {}
