import * as vscode from "vscode";

const channel = vscode.window.createOutputChannel("Symbols");
export const log = {
	info: (...args) => {
		const time = new Date().toLocaleTimeString();
		channel.appendLine(`[INFO ${time}] ${args.join(" ")}`);
	},
};
