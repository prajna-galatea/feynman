import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

function parseFrontmatter(text) {
	const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return {};

	const frontmatter = {};
	for (const line of match[1].split("\n")) {
		const separator = line.indexOf(":");
		if (separator === -1) continue;
		const key = line.slice(0, separator).trim();
		const value = line.slice(separator + 1).trim();
		if (!key) continue;
		frontmatter[key] = value;
	}
	return frontmatter;
}

export function readPromptSpecs(appRoot) {
	const dir = resolve(appRoot, "prompts");
	return readdirSync(dir)
		.filter((f) => f.endsWith(".md"))
		.map((f) => {
			const text = readFileSync(resolve(dir, f), "utf8");
			const fm = parseFrontmatter(text);
			return {
				name: f.replace(/\.md$/, ""),
				description: fm.description ?? "",
				args: fm.args ?? "",
				section: fm.section ?? "Research Workflows",
				topLevelCli: fm.topLevelCli === "true",
			};
		});
}

export const extensionCommandSpecs = [
	{ name: "capabilities", args: "", section: "專案與會話", description: "顯示已安裝套件、發現入口與執行時的能力計數。", publicDocs: true },
	{ name: "commands", args: "", section: "專案與會話", description: "瀏覽所有可用的斜線指令（內建與套件）。", publicDocs: true },
	{ name: "help", args: "", section: "專案與會話", description: "以分組方式顯示 Feynman 指令，並在編輯器預填所選指令。", publicDocs: true },
	{ name: "feynman-model", args: "", section: "專案與會話", description: "開啟 Feynman 模型選單（主模型 + 各子代理覆寫）。", publicDocs: true },
	{ name: "init", args: "", section: "專案與會話", description: "為研究專案初始化 AGENTS.md 與會話日誌資料夾。", publicDocs: true },
	{ name: "outputs", args: "", section: "專案與會話", description: "瀏覽所有研究產出（papers、outputs、experiments、notes）。", publicDocs: true },
	{ name: "service-tier", args: "", section: "專案與會話", description: "檢視或設定支援模型的服務層級（service tier）覆寫值。", publicDocs: true },
	{ name: "tools", args: "", section: "專案與會話", description: "瀏覽所有可呼叫工具與其來源、參數摘要。", publicDocs: true },
];

export const livePackageCommandGroups = [
	{
		title: "代理與委派",
		commands: [
			{ name: "agents", usage: "/agents" },
			{ name: "run", usage: "/run <agent> <task>" },
			{ name: "chain", usage: "/chain agent1 -> agent2" },
			{ name: "parallel", usage: "/parallel agent1 -> agent2" },
		],
	},
	{
		title: "內建套件指令",
		commands: [
			{ name: "ps", usage: "/ps" },
			{ name: "schedule-prompt", usage: "/schedule-prompt" },
			{ name: "search", usage: "/search" },
			{ name: "preview", usage: "/preview" },
			{ name: "hotkeys", usage: "/hotkeys" },
			{ name: "new", usage: "/new" },
			{ name: "quit", usage: "/quit" },
			{ name: "exit", usage: "/exit" },
		],
	},
];

export const cliCommandSections = [
	{
		title: "核心",
		commands: [
			{ usage: "feynman", description: "啟動互動式 REPL。" },
			{ usage: "feynman chat [prompt]", description: "明確啟動對話，可選擇附上初始提示詞。" },
			{ usage: "feynman help", description: "顯示 CLI 使用說明。" },
			{ usage: "feynman setup", description: "執行引導式設定精靈。" },
			{ usage: "feynman setup preview", description: "安裝或驗證預覽功能所需的相依套件。" },
			{ usage: "feynman doctor", description: "診斷設定、認證、Pi 執行環境與預覽相依套件。" },
			{ usage: "feynman status", description: "顯示目前設定摘要。" },
		],
	},
	{
		title: "模型管理",
		commands: [
			{ usage: "feynman model list", description: "列出 Pi 認證存放處中可用的模型。" },
			{ usage: "feynman model login [id]", description: "以 OAuth 或 API 金鑰設定方式登入模型供應商。" },
			{ usage: "feynman model logout [id]", description: "清除已儲存的模型供應商認證。" },
			{ usage: "feynman model set <provider/model>", description: "設定預設模型（亦接受 provider:model 格式）。" },
			{ usage: "feynman model tier [value]", description: "檢視或設定請求服務層級覆寫值。" },
		],
	},
	{
		title: "AlphaXiv",
		commands: [
			{ usage: "feynman alpha login", description: "登入 alphaXiv。" },
			{ usage: "feynman alpha logout", description: "清除 alphaXiv 認證。" },
			{ usage: "feynman alpha status", description: "檢查 alphaXiv 認證狀態。" },
		],
	},
	{
		title: "工具",
		commands: [
			{ usage: "feynman packages list", description: "顯示核心與可選 Pi 套件預設組合。" },
			{ usage: "feynman packages install <preset>", description: "依需求安裝可選套件預設組合。" },
			{ usage: "feynman search status", description: "顯示 Pi 網路存取狀態與設定檔路徑。" },
			{ usage: "feynman search set <provider> [api-key]", description: "設定網路搜尋供應商，並可選擇儲存 API 金鑰。" },
			{ usage: "feynman search clear", description: "將網路搜尋供應商重設為 auto，保留既有 API 金鑰。" },
			{ usage: "feynman update [package]", description: "更新已安裝的所有套件或指定套件。" },
		],
	},
];

export const legacyFlags = [
	{ usage: '--prompt "<text>"', description: "執行單次提示詞後結束。" },
	{ usage: "--alpha-login", description: "登入 alphaXiv 後結束。" },
	{ usage: "--alpha-logout", description: "清除 alphaXiv 認證後結束。" },
	{ usage: "--alpha-status", description: "顯示 alphaXiv 認證狀態後結束。" },
	{ usage: "--model <provider/model|provider:model>", description: "強制指定使用的模型。" },
	{ usage: "--service-tier <tier>", description: "本次執行覆寫請求服務層級。" },
	{ usage: "--thinking <level>", description: "設定思考強度：off | minimal | low | medium | high | xhigh。" },
	{ usage: "--cwd <path>", description: "設定工具的工作目錄。" },
	{ usage: "--session-dir <path>", description: "設定會話儲存目錄。" },
	{ usage: "--new-session", description: "啟動新的持久化會話。" },
	{ usage: "--doctor", description: "等同 `feynman doctor`。" },
	{ usage: "--setup-preview", description: "等同 `feynman setup preview`。" },
];

export const topLevelCommandNames = ["alpha", "chat", "doctor", "help", "model", "packages", "search", "setup", "status", "update"];

export function formatSlashUsage(command) {
	return `/${command.name}${command.args ? ` ${command.args}` : ""}`;
}

export function formatCliWorkflowUsage(command) {
	return `feynman ${command.name}${command.args ? ` ${command.args}` : ""}`;
}

export function getExtensionCommandSpec(name) {
	return extensionCommandSpecs.find((command) => command.name === name);
}
