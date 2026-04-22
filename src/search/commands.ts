import {
	getPiWebAccessStatus,
	savePiWebAccessConfig,
	type PiWebAccessConfig,
	type PiWebSearchProvider,
} from "../pi/web-access.js";
import { printInfo } from "../ui/terminal.js";

const SEARCH_PROVIDERS: PiWebSearchProvider[] = ["auto", "perplexity", "exa", "gemini"];
const PROVIDER_API_KEY_FIELDS: Partial<Record<PiWebSearchProvider, keyof PiWebAccessConfig>> = {
	perplexity: "perplexityApiKey",
	exa: "exaApiKey",
	gemini: "geminiApiKey",
};

export function printSearchStatus(status = getPiWebAccessStatus()): void {
	const configPathSuffix = status.configExists ? "" : "（尚未建立）";
	printInfo("管理者：pi-web-access");
	printInfo(`搜尋路由：${status.routeLabel}`);
	printInfo(`請求路由：${status.requestProvider}`);
	printInfo(`搜尋流程：${status.workflow}`);
	printInfo(`Perplexity API：${status.perplexityConfigured ? "已設定" : "尚未設定"}`);
	printInfo(`Exa API：${status.exaConfigured ? "已設定" : "尚未設定"}`);
	printInfo(`Gemini API：${status.geminiApiConfigured ? "已設定" : "尚未設定"}`);
	printInfo(`瀏覽器設定檔：${status.chromeProfile ?? "預設 Chromium 設定檔"}`);
	printInfo(`設定檔路徑：${status.configPath}${configPathSuffix}`);
	if (!status.configExists) {
		printInfo("尚未設定。請擇一執行：");
		printInfo("  feynman search set auto");
		printInfo("  feynman search set perplexity <api-key>");
		printInfo("  feynman search set exa <api-key>");
		printInfo("  feynman search set gemini <api-key>");
	}
}

export function setSearchProvider(provider: PiWebSearchProvider, apiKey?: string): void {
	if (!SEARCH_PROVIDERS.includes(provider)) {
		throw new Error(`用法：feynman search set <${SEARCH_PROVIDERS.join("|")}> [api-key]`);
	}
	if (apiKey !== undefined && provider === "auto") {
		throw new Error("auto 供應商不使用 API 金鑰。用法：feynman search set auto");
	}

	const updates: Partial<Record<keyof PiWebAccessConfig, unknown>> = {
		provider,
		searchProvider: provider,
		workflow: "none",
		route: undefined,
	};
	const apiKeyField = PROVIDER_API_KEY_FIELDS[provider];
	if (apiKeyField && apiKey !== undefined) {
		updates[apiKeyField] = apiKey;
	}
	savePiWebAccessConfig(updates);

	const status = getPiWebAccessStatus();
	console.log(`網路搜尋供應商已設為 ${status.routeLabel}。`);
	console.log(`設定檔路徑：${status.configPath}`);
}

export function clearSearchConfig(): void {
	savePiWebAccessConfig({ provider: undefined, searchProvider: undefined, route: undefined, workflow: "none" });

	const status = getPiWebAccessStatus();
	console.log(`網路搜尋供應商已重設為 ${status.routeLabel}。`);
	console.log(`設定檔路徑：${status.configPath}`);
}
