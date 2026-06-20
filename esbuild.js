import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const isProduction = process.argv.includes("--production");
const isWatch = process.argv.includes("--watch");

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.dirname(__filename);
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const iconsSourceDir = path.join(srcDir, "icons");
const iconsDistDir = path.join(distDir, "icons");
const sourceThemePath = path.join(srcDir, "symbol-icon-theme.json");
const defaultThemePath = path.join(distDir, "symbol-icon-theme.json");
const modifiedThemePath = path.join(distDir, "symbol-icon-theme.modified.json");

async function copyRuntimeAssets() {
	await fs.mkdir(distDir, { recursive: true });
	await fs.rm(iconsDistDir, { recursive: true, force: true });
	await fs.cp(iconsSourceDir, iconsDistDir, { recursive: true, force: true });
	await fs.copyFile(sourceThemePath, defaultThemePath);
	await fs.copyFile(sourceThemePath, modifiedThemePath);
}

const copyRuntimeAssetsPlugin = {
	name: "copy-runtime-assets",
	setup(build) {
		build.onEnd(async (result) => {
			if (result.errors.length > 0) {
				return;
			}

			await copyRuntimeAssets();
		});
	},
};

const buildOptions = {
	entryPoints: {
		extension: path.join(srcDir, "extension.js"),
	},
	bundle: true,
	platform: "node",
	format: "cjs",
	outdir: distDir,
	outExtension: {
		".js": ".cjs",
	},
	external: ["vscode"],
	logLevel: "info",
	sourcemap: isProduction ? false : "linked",
	minify: false,
	plugins: [copyRuntimeAssetsPlugin],
};

async function main() {
	if (isWatch) {
		const context = await esbuild.context(buildOptions);
		await context.watch();
		console.log("Watching dist bundle and runtime assets...");
		return;
	}

	await esbuild.build(buildOptions);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
