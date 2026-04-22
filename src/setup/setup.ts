import { isLoggedIn as isAlphaLoggedIn, login as loginAlpha } from "@companion-ai/alpha-hub/lib";
import { dirname } from "node:path";

import { getPiWebAccessStatus } from "../pi/web-access.js";
import { normalizeFeynmanSettings } from "../pi/settings.js";
import type { ThinkingLevel } from "../pi/settings.js";
import { getMissingConfiguredPackages, installPackageSources } from "../pi/package-ops.js";
import { listOptionalPackagePresets } from "../pi/package-presets.js";
import { getCurrentModelSpec, runModelSetup } from "../model/commands.js";
import { buildModelStatusSnapshotFromRecords, getAvailableModelRecords, getSupportedModelRecords } from "../model/catalog.js";
import { PANDOC_FALLBACK_PATHS, resolveExecutable } from "../system/executables.js";
import { setupPreviewDependencies } from "./preview.js";
import { printInfo, printSection, printSuccess } from "../ui/terminal.js";
import {
	isInteractiveTerminal,
	promptConfirm,
	promptIntro,
	promptMultiSelect,
	promptOutro,
	SetupCancelledError,
} from "./prompts.js";

type SetupOptions = {
	settingsPath: string;
	bundledSettingsPath: string;
	authPath: string;
	workingDir: string;
	sessionDir: string;
	appRoot: string;
	defaultThinkingLevel?: ThinkingLevel;
};

function printNonInteractiveSetupGuidance(): void {
	printInfo("非互動式終端機。請改用明確指令：");
	printInfo("  feynman model login <provider>");
	printInfo("  feynman model set <provider/model>");
	printInfo("  # 或透過環境變數／auth.json 設定 API 金鑰後重新執行 `feynman model list`");
	printInfo("  feynman alpha login");
	printInfo("  feynman doctor");
}

function summarizePackageSources(sources: string[]): string {
	if (sources.length <= 3) {
		return sources.join(", ");
	}

	return `${sources.slice(0, 3).join(", ")} 等共 +${sources.length - 3} 個`;
}

async function maybeInstallBundledPackages(options: SetupOptions): Promise<void> {
	const agentDir = dirname(options.authPath);
	const { missing, bundled } = getMissingConfiguredPackages(options.workingDir, agentDir, options.appRoot);
	const userMissing = missing.filter((entry) => entry.scope === "user").map((entry) => entry.source);
	const projectMissing = missing.filter((entry) => entry.scope === "project").map((entry) => entry.source);

	printSection("套件");
	if (bundled.length > 0) {
		printInfo(`內建研究套件已就緒：${summarizePackageSources(bundled.map((entry) => entry.source))}`);
	}

	if (missing.length === 0) {
		printInfo("不需要額外安裝套件。");
		return;
	}

	printInfo(`缺少的套件：${summarizePackageSources(missing.map((entry) => entry.source))}`);
	const shouldInstall = await promptConfirm("現在安裝缺少的 Feynman 套件嗎？", true);
	if (!shouldInstall) {
		printInfo("略過套件安裝。Feynman 稍後若有需要可能會自行補裝。");
		return;
	}

	if (userMissing.length > 0) {
		try {
			await installPackageSources(options.workingDir, agentDir, userMissing);
			printSuccess(`已安裝內建套件：${summarizePackageSources(userMissing)}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			printInfo(message.includes("No supported package manager found")
				? "無可用套件管理工具，無法進行額外安裝。Standalone bundle 仍可使用其隨附的套件運作。"
				: `已略過套件安裝：${message}`);
		}
	}

	if (projectMissing.length > 0) {
		try {
			await installPackageSources(options.workingDir, agentDir, projectMissing, { local: true });
			printSuccess(`已安裝專案套件：${summarizePackageSources(projectMissing)}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			printInfo(`已略過專案套件安裝：${message}`);
		}
	}
}

async function maybeInstallOptionalPackages(options: SetupOptions): Promise<void> {
	const agentDir = dirname(options.authPath);
	const presets = listOptionalPackagePresets();
	if (presets.length === 0) {
		return;
	}

	const selectedPresets = await promptMultiSelect(
		"可選套件",
		presets.map((preset) => ({
			value: preset.name,
			label: preset.name,
			hint: preset.description,
		})),
		[],
	);

	if (selectedPresets.length === 0) {
		printInfo("未選擇任何可選套件。");
		return;
	}

	for (const presetName of selectedPresets) {
		const preset = presets.find((entry) => entry.name === presetName);
		if (!preset) continue;
		try {
			await installPackageSources(options.workingDir, agentDir, preset.sources, {
				persist: true,
			});
			printSuccess(`已安裝可選組合：${preset.name}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			printInfo(message.includes("No supported package manager found")
				? `已略過可選組合 ${preset.name}：無可用套件管理工具。`
				: `已略過可選組合 ${preset.name}：${message}`);
		}
	}
}

async function maybeLoginAlpha(): Promise<void> {
	if (isAlphaLoggedIn()) {
		printInfo("alphaXiv 已設定完成。");
		return;
	}

	const shouldLogin = await promptConfirm("現在連線 alphaXiv 嗎？", true);
	if (!shouldLogin) {
		printInfo("暫時略過 alphaXiv 登入。");
		return;
	}

	try {
		await loginAlpha();
		printSuccess("alphaXiv 登入完成");
	} catch (error) {
		printInfo(`已略過 alphaXiv 登入：${error instanceof Error ? error.message : String(error)}`);
	}
}

async function maybeInstallPreviewDependencies(): Promise<void> {
	if (resolveExecutable("pandoc", PANDOC_FALLBACK_PATHS)) {
		printInfo("預覽功能已設定完成。");
		return;
	}

	const shouldInstall = await promptConfirm("安裝 pandoc 以支援預覽／匯出功能嗎？", false);
	if (!shouldInstall) {
		printInfo("略過預覽相依套件安裝。");
		return;
	}

	try {
		const result = setupPreviewDependencies();
		printSuccess(result.message);
	} catch (error) {
		printInfo(`已略過預覽設定：${error instanceof Error ? error.message : String(error)}`);
	}
}

export async function runSetup(options: SetupOptions): Promise<void> {
	if (!isInteractiveTerminal()) {
		printNonInteractiveSetupGuidance();
		return;
	}

	try {
		await promptIntro("Feynman 設定");
		await runModelSetup(options.settingsPath, options.authPath);
		await maybeInstallBundledPackages(options);
		await maybeInstallOptionalPackages(options);
		await maybeLoginAlpha();
		await maybeInstallPreviewDependencies();

		normalizeFeynmanSettings(
			options.settingsPath,
			options.bundledSettingsPath,
			options.defaultThinkingLevel ?? "medium",
			options.authPath,
		);

		const modelStatus = buildModelStatusSnapshotFromRecords(
			getSupportedModelRecords(options.authPath),
			getAvailableModelRecords(options.authPath),
			getCurrentModelSpec(options.settingsPath),
		);
		printSection("就緒");
		printInfo(`模型：${getCurrentModelSpec(options.settingsPath) ?? "尚未設定"}`);
		printInfo(`alphaXiv：${isAlphaLoggedIn() ? "已設定" : "尚未設定"}`);
		printInfo(`預覽：${resolveExecutable("pandoc", PANDOC_FALLBACK_PATHS) ? "已設定" : "尚未設定"}`);
		printInfo(`網路存取：${getPiWebAccessStatus().routeLabel}`);
		if (modelStatus.recommended && !modelStatus.currentValid) {
			printInfo(`建議模型：${modelStatus.recommended}`);
		}

		await promptOutro("Feynman 已就緒");
	} catch (error) {
		if (error instanceof SetupCancelledError) {
			printInfo("已取消設定。");
			return;
		}

		throw error;
	}
}
