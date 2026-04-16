import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const postgresPassword = randomPassword();
  const meiliMasterKey = randomPassword();
  const jwtSecret = randomPassword();
  const jwtRefreshSecret = randomPassword();
  const credsKey = randomPassword();
  const credsIv = randomPassword();
  const mongoPassword = randomPassword();

  const libreChatYaml = `# For more information, see the Configuration Guide:
# https://www.librechat.ai/docs/configuration/librechat_yaml

# Configuration version (required)
version: 1.2.1

# Cache settings: Set to true to enable caching
cache: true

# File strategy s3/firebase
# fileStrategy: "s3"

# Custom interface configuration
interface:
  customWelcome: "Welcome to LibreChat! Enjoy your experience."
  # MCP Servers UI configuration
  mcpServers:
    placeholder: 'MCP Servers'
  # Privacy policy settings
  privacyPolicy:
    externalUrl: 'https://librechat.ai/privacy-policy'
    openNewTab: true

  # Terms of service
  termsOfService:
    externalUrl: 'https://librechat.ai/tos'
    openNewTab: true
    modalAcceptance: true
    modalTitle: "Terms of Service for LibreChat"
    modalContent: |
      # Terms and Conditions for LibreChat

      *Effective Date: February 18, 2024*

      Welcome to LibreChat, the informational website for the open-source AI chat platform, available at https://librechat.ai. These Terms of Service ("Terms") govern your use of our website and the services we offer. By accessing or using the Website, you agree to be bound by these Terms and our Privacy Policy, accessible at https://librechat.ai//privacy.

      ## 1. Ownership

      Upon purchasing a package from LibreChat, you are granted the right to download and use the code for accessing an admin panel for LibreChat. While you own the downloaded code, you are expressly prohibited from reselling, redistributing, or otherwise transferring the code to third parties without explicit permission from LibreChat.

      ## 2. User Data

      We collect personal data, such as your name, email address, and payment information, as described in our Privacy Policy. This information is collected to provide and improve our services, process transactions, and communicate with you.

      ## 3. Non-Personal Data Collection

      The Website uses cookies to enhance user experience, analyze site usage, and facilitate certain functionalities. By using the Website, you consent to the use of cookies in accordance with our Privacy Policy.

      ## 4. Use of the Website

      You agree to use the Website only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Website. Prohibited behavior includes harassing or causing distress or inconvenience to any person, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within the Website.

      ## 5. Governing Law

      These Terms shall be governed by and construed in accordance with the laws of the United States, without giving effect to any principles of conflicts of law.

      ## 6. Changes to the Terms

      We reserve the right to modify these Terms at any time. We will notify users of any changes by email. Your continued use of the Website after such changes have been notified will constitute your consent to such changes.

      ## 7. Contact Information

      If you have any questions about these Terms, please contact us at contact@librechat.ai.

      By using the Website, you acknowledge that you have read these Terms of Service and agree to be bound by them.

  endpointsMenu: true
  modelSelect: true
  parameters: true
  sidePanel: true
  presets: true
  prompts: true
  bookmarks: true
  multiConvo: true
  agents: true
  # Temporary chat retention period in hours (default: 720, min: 1, max: 8760)
  # temporaryChatRetention: 1

# Example Cloudflare turnstile (optional)
#turnstile:
#  siteKey: "your-site-key-here"
#  options:
#    language: "auto"    # "auto" or an ISO 639-1 language code (e.g. en)
#    size: "normal"      # Options: "normal", "compact", "flexible", or "invisible"

# Example Registration Object Structure (optional)
registration:
  socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
  # allowedDomains:
  # - "gmail.com"


# Example Balance settings
# balance:
#   enabled: false
#   startBalance: 20000
#   autoRefillEnabled: false
#   refillIntervalValue: 30
#   refillIntervalUnit: 'days'
#   refillAmount: 10000

# speech:
#   tts:
#     openai:
#       url: ''
#       apiKey: ''
#       model: ''
#       voices: ['']

#
#   stt:
#     openai:
#       url: ''
#       apiKey: ''
#       model: ''

# rateLimits:
#   fileUploads:
#     ipMax: 100
#     ipWindowInMinutes: 60  # Rate limit window for file uploads per IP
#     userMax: 50
#     userWindowInMinutes: 60  # Rate limit window for file uploads per user
#   conversationsImport:
#     ipMax: 100
#     ipWindowInMinutes: 60  # Rate limit window for conversation imports per IP
#     userMax: 50
#     userWindowInMinutes: 60  # Rate limit window for conversation imports per user

# Example Actions Object Structure
actions:
  allowedDomains:
    - "swapi.dev"
    - "librechat.ai"
    - "google.com"

# Example MCP Servers Object Structure
# mcpServers:
#   everything:
#     # type: sse # type can optionally be omitted
#     url: http://localhost:3001/sse
#     timeout: 60000  # 1 minute timeout for this server, this is the default timeout for MCP servers.
#   puppeteer:
#     type: stdio
#     command: npx
#     args:
#       - -y
#       - "@modelcontextprotocol/server-puppeteer"
#     timeout: 300000  # 5 minutes timeout for this server
#   filesystem:
#     # type: stdio
#     command: npx
#     args:
#       - -y
#       - "@modelcontextprotocol/server-filesystem"
#       - /home/user/LibreChat/
#     iconPath: /home/user/LibreChat/client/public/assets/logo.svg
#   mcp-obsidian:
#     command: npx
#     args:
#       - -y
#       - "mcp-obsidian"
#       - /path/to/obsidian/vault

# Definition of custom endpoints
endpoints:
  # assistants:
  #   disableBuilder: false # Disable Assistants Builder Interface by setting to "true"
  #   pollIntervalMs: 3000  # Polling interval for checking assistant updates
  #   timeoutMs: 180000  # Timeout for assistant operations
  #   # Should only be one or the other, either "supportedIds" or "excludedIds"
  #   supportedIds: ["asst_supportedAssistantId1", "asst_supportedAssistantId2"]
  #   # excludedIds: ["asst_excludedAssistantId"]
  #   # Only show assistants that the user created or that were created externally (e.g. in Assistants playground).
  #   # privateAssistants: false # Does not work with "supportedIds" or "excludedIds"
  #   # (optional) Models that support retrieval, will default to latest known OpenAI models that support the feature
  #   retrievalModels: ["gpt-4-turbo-preview"]
  #   # (optional) Assistant Capabilities available to all users. Omit the ones you wish to exclude. Defaults to list below.
  #   capabilities: ["code_interpreter", "retrieval", "actions", "tools", "image_vision"]
  # agents:
  #   # (optional) Default recursion depth for agents, defaults to 25
  #   recursionLimit: 50
  #   # (optional) Max recursion depth for agents, defaults to 25
  #   maxRecursionLimit: 100
  #   # (optional) Disable the builder interface for agents
  #   disableBuilder: false
  #   # (optional) Agent Capabilities available to all users. Omit the ones you wish to exclude. Defaults to list below.
  #   capabilities: ["execute_code", "file_search", "actions", "tools"]
  custom:
    # Groq Example
    - name: 'groq'
      apiKey: ''
      baseURL: 'https://api.groq.com/openai/v1/'
      models:
        default:
          [
            'llama3-70b-8192',
            'llama3-8b-8192',
            'llama2-70b-4096',
            'mixtral-8x7b-32768',
            'gemma-7b-it',
          ]
        fetch: false
      titleConvo: true
      titleModel: 'mixtral-8x7b-32768'
      modelDisplayLabel: 'groq'

    # Mistral AI Example
    - name: 'Mistral' # Unique name for the endpoint
      # For "apiKey" and "baseURL", you can use environment variables that you define.
      # recommended environment variables:
      apiKey: ''
      baseURL: 'https://api.mistral.ai/v1'

      # Models configuration
      models:
        # List of default models to use. At least one value is required.
        default: ['mistral-tiny', 'mistral-small', 'mistral-medium']
        # Fetch option: Set to true to fetch models from API.
        fetch: true # Defaults to false.

      # Optional configurations

      # Title Conversation setting
      titleConvo: true # Set to true to enable title conversation

      # Title Method: Choose between "completion" or "functions".
      # titleMethod: "completion"  # Defaults to "completion" if omitted.

      # Title Model: Specify the model to use for titles.
      titleModel: 'mistral-tiny' # Defaults to "gpt-3.5-turbo" if omitted.

      # Summarize setting: Set to true to enable summarization.
      # summarize: false

      # Summary Model: Specify the model to use if summarization is enabled.
      # summaryModel: "mistral-tiny"  # Defaults to "gpt-3.5-turbo" if omitted.

      # Force Prompt setting: If true, sends a "prompt" parameter instead of "messages".
      # forcePrompt: false

      # The label displayed for the AI model in messages.
      modelDisplayLabel: 'Mistral' # Default is "AI" when not set.

      # Add additional parameters to the request. Default params will be overwritten.
      # addParams:
      # safe_prompt: true # This field is specific to Mistral AI: https://docs.mistral.ai/api/

      # Drop Default params parameters from the request. See default params in guide linked below.
      # NOTE: For Mistral, it is necessary to drop the following parameters or you will encounter a 422 Error:
      dropParams: ['stop', 'user', 'frequency_penalty', 'presence_penalty']

    # OpenRouter Example
    - name: 'OpenRouter'
      # For "apiKey" and "baseURL", you can use environment variables that you define.
      # recommended environment variables:
      apiKey: ''
      baseURL: 'https://openrouter.ai/api/v1'
      models:
        default: ['meta-llama/llama-3-70b-instruct']
        fetch: true
      titleConvo: true
      titleModel: 'meta-llama/llama-3-70b-instruct'
      # Recommended: Drop the stop parameter from the request as Openrouter models use a variety of stop tokens.
      dropParams: ['stop']
      modelDisplayLabel: 'OpenRouter'

    # Portkey AI Example
    - name: "Portkey"
      apiKey: "dummy"
      baseURL: 'https://api.portkey.ai/v1'
      headers:
          x-portkey-api-key: ''
          x-portkey-virtual-key: ''
      models:
          default: ['gpt-4o-mini', 'gpt-4o', 'chatgpt-4o-latest']
          fetch: true
      titleConvo: true
      titleModel: 'current_model'
      summarize: false
      summaryModel: 'current_model'
      forcePrompt: false
      modelDisplayLabel: 'Portkey'
      iconURL: https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/rjqy7ghvjoiu4cd1xjbf
# fileConfig:
#   endpoints:
#     assistants:
#       fileLimit: 5
#       fileSizeLimit: 10  # Maximum size for an individual file in MB
#       totalSizeLimit: 50  # Maximum total size for all files in a single request in MB
#       supportedMimeTypes:
#         - "image/.*"
#         - "application/pdf"
#     openAI:
#       disabled: true  # Disables file uploading to the OpenAI endpoint
#     default:
#       totalSizeLimit: 20
#     YourCustomEndpointName:
#       fileLimit: 2
#       fileSizeLimit: 5
#   serverFileSizeLimit: 100  # Global server file size limit in MB
#   avatarSizeLimit: 2  # Limit for user avatar image size in MB
#   imageGeneration: # Image Gen settings, either percentage or px
#     percentage: 100
#     px: 1024
#   # Client-side image resizing to prevent upload errors
#   clientImageResize:
#     enabled: false  # Enable/disable client-side image resizing (default: false)
#     maxWidth: 1900  # Maximum width for resized images (default: 1900)
#     maxHeight: 1900  # Maximum height for resized images (default: 1900)
#     quality: 0.92  # JPEG quality for compression (0.0-1.0, default: 0.92)
# # See the Custom Configuration Guide for more information on Assistants Config:
# # https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/assistants_endpoint

# Memory configuration for user memories
# memory:
#   # (optional) Disable memory functionality
#   disabled: false
#   # (optional) Restrict memory keys to specific values to limit memory storage and improve consistency
#   validKeys: ["preferences", "work_info", "personal_info", "skills", "interests", "context"]
#   # (optional) Maximum token limit for memory storage (not yet implemented for token counting)
#   tokenLimit: 10000
#   # (optional) Enable personalization features (defaults to true if memory is configured)
#   # When false, users will not see the Personalization tab in settings
#   personalize: true
#   # Memory agent configuration - either use an existing agent by ID or define inline
#   agent:
#     # Option 1: Use existing agent by ID
#     id: "your-memory-agent-id"
#     # Option 2: Define agent inline
#     # provider: "openai"
#     # model: "gpt-4o-mini"
#     # instructions: "You are a memory management assistant. Store and manage user information accurately."
#     # model_parameters:
#     #   temperature: 0.1
  `;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.librechatImage,
      },
      env: [
        `HOST=0.0.0.0`,
        `PORT=3080`,
        `MONGO_URI=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.appServiceName}-mongo:27017/?tls=false`,
        `MEILI_HOST=http://$(PROJECT_NAME)_${input.appServiceName}-meilisearch:7700`,
        `RAG_PORT=8000`,
        `RAG_API_URL=http://$(PROJECT_NAME)_${input.appServiceName}-rag-api:8000`,
        `DOMAIN_CLIENT=https://$(PRIMARY_DOMAIN)`,
        `DOMAIN_SERVER=https://$(PRIMARY_DOMAIN)`,
        `NO_INDEX=true`,
        `TRUST_PROXY=1`,
        `CONSOLE_JSON=false`,
        `DEBUG_LOGGING=true`,
        `DEBUG_CONSOLE=false`,
        `SEARCH=true`,
        `MEILI_NO_ANALYTICS=true`,
        `MEILI_MASTER_KEY=${meiliMasterKey}`,
        `ALLOW_EMAIL_LOGIN=${input.allowEmailLogin}`,
        `ALLOW_REGISTRATION=${input.allowRegistration}`,
        `ALLOW_SOCIAL_LOGIN=false`,
        `ALLOW_SOCIAL_REGISTRATION=false`,
        `ALLOW_PASSWORD_RESET=false`,
        `ALLOW_UNVERIFIED_EMAIL_LOGIN=true`,
        `SESSION_EXPIRY=1000 * 60 * 15`,
        `REFRESH_TOKEN_EXPIRY=(1000 * 60 * 60 * 24) * 7`,
        `JWT_SECRET=${jwtSecret}`,
        `JWT_REFRESH_SECRET=${jwtRefreshSecret}`,
        `APP_TITLE=${input.appTitle}`,
        `HELP_AND_FAQ_URL=https://librechat.ai`,
        `ALLOW_SHARED_LINKS=true`,
        `ALLOW_SHARED_LINKS_PUBLIC=true`,
        `CREDS_KEY=${credsKey}`,
        `CREDS_IV=${credsIv}`,
        `DEBUG_PLUGINS=true`,
        `BAN_VIOLATIONS=true`,
        `BAN_DURATION=1000 * 60 * 60 * 2`,
        `BAN_INTERVAL=20`,
        `LOGIN_VIOLATION_SCORE=1`,
        `REGISTRATION_VIOLATION_SCORE=1`,
        `CONCURRENT_VIOLATION_SCORE=1`,
        `MESSAGE_VIOLATION_SCORE=1`,
        `NON_BROWSER_VIOLATION_SCORE=20`,
        `LIMIT_CONCURRENT_MESSAGES=true`,
        `CONCURRENT_MESSAGE_MAX=2`,
        `LIMIT_MESSAGE_IP=true`,
        `MESSAGE_IP_MAX=40`,
        `MESSAGE_IP_WINDOW=1`,
        `LIMIT_MESSAGE_USER=false`,
        `MESSAGE_USER_MAX=40`,
        `MESSAGE_USER_WINDOW=1`,
        `CONFIG_PATH="/app/librechat.yaml"`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "librechat-images",
          mountPath: "/app/client/public/images",
        },
        {
          type: "volume",
          name: "librechat-uploads",
          mountPath: "/app/uploads",
        },
        {
          type: "volume",
          name: "librechat-logs",
          mountPath: "/app/api/logs",
        },
        {
          type: "file",
          content: libreChatYaml,
          mountPath: "/app/librechat.yaml",
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-mongo`,
      password: mongoPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-meilisearch`,
      source: {
        type: "image",
        image: input.meilisearchImage,
      },
      env: [
        `MEILI_HOST=http://0.0.0.0:7700`,
        `MEILI_NO_ANALYTICS=true`,
        `MEILI_MASTER_KEY=${meiliMasterKey}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "meilisearch-data",
          mountPath: "/meili_data",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-vector-db`,
      password: postgresPassword,
      user: "librechat",
      databaseName: "librechat_vectors",
      image: input.vectorDbImage,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-rag-api`,
      source: {
        type: "image",
        image: input.ragApiImage,
      },
      env: [
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-vector-db`,
        `RAG_PORT=8000`,
        `POSTGRES_DB=librechat_vectors`,
        `POSTGRES_USER=librechat`,
        `POSTGRES_PASSWORD=${postgresPassword}`,
        `OPENAI_API_KEY=${input.openaiApiKey}`,
      ].join("\n"),
    },
  });

  return { services };
}
