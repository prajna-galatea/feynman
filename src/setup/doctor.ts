import { getUserName as getAlphaUserName, isLoggedIn as isAlphaLoggedIn } from "@companion-ai/alpha-hub/lib";

import { readFileSync } from "node:fs";

import { formatPiWebAccessDoctorLines, getPiWebAccessStatus } from "../pi/web-access.js";
import { BROWSER_FALLBACK_PATHS, PANDOC_FALLBACK_PATHS, resolveExecutable } from "../system/executables.js";
import { readJson } from "../pi/settings.js";
import { validatePiInstallation } from "../pi/runtime.js";
import { printInfo, printPanel, printSection } from "../ui/terminal.js";
import { getCurrentModelSpec } from "../model/commands.js";
import { buildModelStatusSnapshotFromRecords, getAvailableModelRecords, getSupportedModelRecords } from "../model/catalog.js";
import { createModelRegistry, getModelsJsonPath } from "../model/registry.js";
import { getConfiguredServiceTier } from "../model/service-tier.js";

function findProvidersMissingApiKey(modelsJsonPath: string): string[] {
	try {
		const raw = readFileSync(modelsJsonPath, "utf8").trim();
		if (!raw) return [];
		const parsed = JSON.parse(raw) as any;
		const providers = parsed?.providers;
		if (!providers || typeof providers !== "object") return [];
		const missing: string[] = [];
		for (const [providerId, config] of Object.entries(providers as Record<string, unknown>)) {
			if (!config || typeof config !== "object") continue;
			const models = (config as any).models;
			if (!Array.isArray(models) || models.length === 0) continue;
			const apiKey = (config as any).apiKey;
			if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
				missing.push(providerId);
			}
		}
		return missing;
	} catch {
		return [];
	}
}

export type DoctorOptions = {
	settingsPath: string;
	authPath: string;
	sessionDir: string;
	workingDir: string;
	appRoot: string;
};

export type FeynmanStatusSnapshot = {
	model?: string;
	modelValid: boolean;
	recommendedModel?: string;
	recommendedModelReason?: string;
	availableModels: string[];
	authenticatedModelCount: number;
	authenticatedProviderCount: number;
	modelGuidance: string[];
	alphaLoggedIn: boolean;
	alphaUser?: string;
	webRouteLabel: string;
	previewConfigured: boolean;
	sessionDir: string;
	pandocReady: boolean;
	browserReady: boolean;
	piReady: boolean;
	missingPiBits: string[];
};

export function collectStatusSnapshot(options: DoctorOptions): FeynmanStatusSnapshot {
	const pandocPath = resolveExecutable("pandoc", PANDOC_FALLBACK_PATHS);
	const browserPath = process.env.PUPPETEER_EXECUTABLE_PATH ?? resolveExecutable("google-chrome", BROWSER_FALLBACK_PATHS);
	const missingPiBits = validatePiInstallation(options.appRoot);
	const webStatus = getPiWebAccessStatus();
	const modelStatus = buildModelStatusSnapshotFromRecords(
		getSupportedModelRecords(options.authPath),
		getAvailableModelRecords(options.authPath),
		getCurrentModelSpec(options.settingsPath),
	);

	return {
		model: modelStatus.current,
		modelValid: modelStatus.currentValid,
		recommendedModel: modelStatus.recommended,
		recommendedModelReason: modelStatus.recommendationReason,
		availableModels: modelStatus.availableModels,
		authenticatedModelCount: modelStatus.availableModels.length,
		authenticatedProviderCount: modelStatus.providers.filter((provider) => provider.configured).length,
		modelGuidance: modelStatus.guidance,
		alphaLoggedIn: isAlphaLoggedIn(),
		alphaUser: isAlphaLoggedIn() ? getAlphaUserName() ?? undefined : undefined,
		webRouteLabel: webStatus.routeLabel,
		previewConfigured: Boolean(pandocPath),
		sessionDir: options.sessionDir,
		pandocReady: Boolean(pandocPath),
		browserReady: Boolean(browserPath),
		piReady: missingPiBits.length === 0,
		missingPiBits,
	};
}

export function runStatus(options: DoctorOptions): void {
	const snapshot = collectStatusSnapshot(options);
	printPanel("Feynman 狀態", [
		"研究殼層目前的設定摘要。",
	]);
	printSection("核心");
	printInfo(`模型：${snapshot.model ?? "尚未設定"}`);
	printInfo(`模型有效：${snapshot.modelValid ? "是" : "否"}`);
	printInfo(`已認證模型數：${snapshot.authenticatedModelCount}`);
	printInfo(`已認證供應商數：${snapshot.authenticatedProviderCount}`);
	printInfo(`建議模型：${snapshot.recommendedModel ?? "無可用建議"}`);
	printInfo(`alphaXiv：${snapshot.alphaLoggedIn ? snapshot.alphaUser ?? "已設定" : "尚未設定"}`);
	printInfo(`網路存取：pi-web-access（${snapshot.webRouteLabel}）`);
	printInfo(`服務層級：${getConfiguredServiceTier(options.settingsPath) ?? "尚未設定"}`);
	printInfo(`預覽：${snapshot.previewConfigured ? "已設定" : "尚未設定"}`);

	printSection("路徑");
	printInfo(`會話：${snapshot.sessionDir}`);

	printSection("執行環境");
	printInfo(`Pi 執行環境：${snapshot.piReady ? "就緒" : "檔案缺失"}`);
	printInfo(`Pandoc：${snapshot.pandocReady ? "就緒" : "缺失"}`);
	printInfo(`瀏覽器預覽：${snapshot.browserReady ? "就緒" : "缺失"}`);
	if (snapshot.missingPiBits.length > 0) {
		for (const entry of snapshot.missingPiBits) {
			printInfo(`  缺失：${entry}`);
		}
	}
	if (snapshot.modelGuidance.length > 0) {
		printSection("建議後續步驟");
		for (const line of snapshot.modelGuidance) {
			printInfo(line);
		}
	}
}

export function runDoctor(options: DoctorOptions): void {
	const settings = readJson(options.settingsPath);
	const modelRegistry = createModelRegistry(options.authPath);
	const supportedModels = getSupportedModelRecords(options.authPath);
	const modelStatus = collectStatusSnapshot(options);
	const pandocPath = resolveExecutable("pandoc", PANDOC_FALLBACK_PATHS);
	const browserPath = process.env.PUPPETEER_EXECUTABLE_PATH ?? resolveExecutable("google-chrome", BROWSER_FALLBACK_PATHS);
	const missingPiBits = validatePiInstallation(options.appRoot);

	printPanel("Feynman 健檢", [
		"檢查設定、認證、執行環境佈線與預覽相依套件。",
	]);
	console.log(`工作目錄：${options.workingDir}`);
	console.log(`會話目錄：${options.sessionDir}`);
	console.log("");
	console.log(`alphaXiv 認證：${isAlphaLoggedIn() ? "正常" : "缺失"}`);
	if (isAlphaLoggedIn()) {
		const name = getAlphaUserName();
		if (name) {
			console.log(`  使用者：${name}`);
		}
	}
	console.log(`支援的模型數：${supportedModels.length}`);
	if (modelStatus.availableModels.length > 0) {
		const sample = modelStatus.availableModels
			.slice(0, 6)
			.join(", ");
		console.log(`  已認證示例：${sample}`);
	}
	console.log(
		`預設模型：${typeof settings.defaultProvider === "string" && typeof settings.defaultModel === "string"
			? `${settings.defaultProvider}/${settings.defaultModel}`
			: "尚未設定"}`,
	);
	console.log(`預設模型有效：${modelStatus.modelValid ? "是" : "否"}`);
	console.log(`已認證供應商：${modelStatus.authenticatedProviderCount}`);
	console.log(`已認證模型：${modelStatus.authenticatedModelCount}`);
	console.log(`服務層級：${getConfiguredServiceTier(options.settingsPath) ?? "尚未設定"}`);
	console.log(`建議模型：${modelStatus.recommendedModel ?? "無可用建議"}`);
	if (modelStatus.recommendedModelReason) {
		console.log(`  原因：${modelStatus.recommendedModelReason}`);
	}
	const modelsError = modelRegistry.getError();
	if (modelsError) {
		console.log("models.json：錯誤");
		for (const line of modelsError.split("\n")) {
			console.log(`  ${line}`);
		}
	} else {
		const modelsJsonPath = getModelsJsonPath(options.authPath);
		console.log(`models.json：${modelsJsonPath}`);
		const missingApiKeyProviders = findProvidersMissingApiKey(modelsJsonPath);
		if (missingApiKeyProviders.length > 0) {
			console.log(`  警告：下列供應商缺少 apiKey：${missingApiKeyProviders.join(", ")}`);
			console.log("  備註：自訂供應商若設有 models[] 清單，則 models.json 中須填入 apiKey 才能使用。");
		}
	}
	console.log(`pandoc：${pandocPath ?? "缺失"}`);
	console.log(`瀏覽器預覽執行環境：${browserPath ?? "缺失"}`);
	for (const line of formatPiWebAccessDoctorLines()) {
		console.log(line);
	}
	console.log(`靜默啟動：${settings.quietStartup === true ? "啟用" : "停用"}`);
	console.log(`主題：${typeof settings.theme === "string" ? settings.theme : "尚未設定"}`);
	if (missingPiBits.length > 0) {
		console.log("pi 執行環境：檔案缺失");
		for (const entry of missingPiBits) {
			console.log(`  ${entry}`);
		}
	} else {
		console.log("pi 執行環境：正常");
	}
	for (const line of modelStatus.modelGuidance) {
		console.log(`後續步驟：${line}`);
	}
	console.log("設定建議：feynman setup");
}
