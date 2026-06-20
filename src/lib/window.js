import * as vscode from "vscode";
import { MESSAGES } from "./constants.js";

export async function confirmReload() {
	const response = await vscode.window.showInformationMessage(MESSAGES.needsReloadToSync, MESSAGES.reloadButton);

	if (response !== MESSAGES.reloadButton) {
		return false;
	}

	vscode.commands.executeCommand("workbench.action.reloadWindow");
	return true;
}
