// Generated using "yarn build-templates"

export const meta = {
  name: "LibreTranslate",
  description:
    "Free and Open Source Machine Translation API. 100% self-hosted, offline capable and easy to setup.",
  instructions: null,
  changeLog: [{ date: "2020-12-20", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/LibreTranslate/LibreTranslate/blob/master/README.md",
    },
    {
      label: "Github",
      url: "https://github.com/LibreTranslate/LibreTranslate",
    },
  ],
  contributors: [{ name: "kaname-png", url: "https://github.com/kaname-png" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "appDomain",
      "chartLimit",
      "reqLimit",
      "bachLimit",
      "suggestions",
      "webUI",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "libretranslate",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "libretranslate/libretranslate:latest",
      },
      appDomain: { type: "string", title: "App Domain" },
      chartLimit: {
        type: "number",
        title: "Character limit for each translation",
        default: 5000,
      },
      reqLimit: { type: "number", title: "Rate request limit", default: 500 },
      bachLimit: {
        type: "number",
        title: "Bach translation limit",
        default: 100,
      },
      googleAnalytics: {
        type: "string",
        title: "Google Analytics",
        default: "",
      },
      suggestions: {
        type: "boolean",
        title: "Translation suggestions",
        default: false,
      },
      webUI: { type: "boolean", title: "Disable Web UI", default: false },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.jpg"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type AppDomain = string;
export type CharacterLimitForEachTranslation = number;
export type RateRequestLimit = number;
export type BachTranslationLimit = number;
export type GoogleAnalytics = string;
export type TranslationSuggestions = boolean;
export type WebUI = boolean;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  appDomain: AppDomain;
  chartLimit: CharacterLimitForEachTranslation;
  reqLimit: RateRequestLimit;
  bachLimit: BachTranslationLimit;
  googleAnalytics?: GoogleAnalytics;
  suggestions: TranslationSuggestions;
  webUI: WebUI;
}
