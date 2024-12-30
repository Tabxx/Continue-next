import {
  ContextProviderWithParams,
  ModelDescription,
  SerializedContinueConfig,
  SlashCommandDescription,
} from "../";

export const DEFAULT_CHAT_MODEL_CONFIG: ModelDescription = {
  "model": "Qwen2.5-Coder-32B-Instruct",
  "title": "qwen2.5",
  "apiBase": "http://hithink.hipilot.myhexin.com/llm_l20/codeqwen25/v1",
  "provider": "openai",
  "contextLength": 12288,
  "systemMessage": "你是一名资深的前端开发,你能帮助用户提供很专业的领域知识回答"
};

const HIPILOT_MODEL_CONFIG: ModelDescription = {
  model: "hipilot",
  contextLength: 128000,
  title: "hipilot",
  systemMessage: "你是一个专业的软件工程开发. 能你给出帮助和简洁的回复.",
  provider: "hipilot"
}


export const DEFAULT_AUTOCOMPLETE_MODEL_CONFIG: ModelDescription = {
  title: "Codestral",
  provider: "mistral",
  model: "codestral-latest",
  apiKey: "",
};

export const FREE_TRIAL_MODELS: ModelDescription[] = [
  {
    title: "Claude 3.5 Sonnet (Free Trial)",
    provider: "free-trial",
    model: "claude-3-5-sonnet-latest",
    systemMessage:
      "You are an expert software developer. You give helpful and concise responses.",
  },
  {
    title: "GPT-4o (Free Trial)",
    provider: "free-trial",
    model: "gpt-4o",
    systemMessage:
      "You are an expert software developer. You give helpful and concise responses.",
  },
  {
    title: "Llama3.1 70b (Free Trial)",
    provider: "free-trial",
    model: "llama3.1-70b",
    systemMessage:
      "You are an expert software developer. You give helpful and concise responses.",
  },
  {
    title: "Codestral (Free Trial)",
    provider: "free-trial",
    model: "codestral-latest",
    systemMessage:
      "You are an expert software developer. You give helpful and concise responses.",
  },
];

export const defaultContextProvidersVsCode: ContextProviderWithParams[] = [
  { name: "code", params: {} },
  { name: "docs", params: {} },
  { name: "diff", params: {} },
  { name: "terminal", params: {} },
  { name: "problems", params: {} },
  { name: "folder", params: {} },
  { name: "codebase", params: {} },
];

export const defaultContextProvidersJetBrains: ContextProviderWithParams[] = [
  { name: "diff", params: {} },
  { name: "folder", params: {} },
  { name: "codebase", params: {} },
];

export const defaultSlashCommandsVscode: SlashCommandDescription[] = [
  {
    name: "share",
    description: "Export the current chat session to markdown",
  },
  {
    name: "cmd",
    description: "Generate a shell command",
  },
  {
    name: "commit",
    description: "Generate a git commit message",
  },
];

export const defaultSlashCommandsJetBrains = [
  {
    name: "share",
    description: "Export the current chat session to markdown",
  },
  {
    name: "commit",
    description: "Generate a git commit message",
  },
];

export const defaultConfig: SerializedContinueConfig = {
  models: [DEFAULT_CHAT_MODEL_CONFIG, HIPILOT_MODEL_CONFIG],
  tabAutocompleteModel: DEFAULT_AUTOCOMPLETE_MODEL_CONFIG,
  contextProviders: defaultContextProvidersVsCode,
  slashCommands: defaultSlashCommandsVscode,
};

export const defaultConfigJetBrains: SerializedContinueConfig = {
  models: [DEFAULT_CHAT_MODEL_CONFIG, HIPILOT_MODEL_CONFIG],
  tabAutocompleteModel: DEFAULT_AUTOCOMPLETE_MODEL_CONFIG,
  contextProviders: defaultContextProvidersJetBrains,
  slashCommands: defaultSlashCommandsJetBrains,
};
