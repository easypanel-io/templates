import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // Generate secure passwords
  const databasePassword = randomPassword();
  const adminApiToken = randomPassword();

  // Database connection string for internal communication
  const databaseUrl = `postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`;

  // Internal API URLs (no external exposure needed)
  const vexaApiInternal = `http://$(PROJECT_NAME)_${input.apiServiceName}:8056`;
  const vexaAdminApiInternal = `http://$(PROJECT_NAME)_${input.apiServiceName}:8057`;

  // PostgreSQL Database
  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  // Vexa API (no external domain - internal only)
  services.push({
    type: "app",
    data: {
      serviceName: input.apiServiceName,
      source: {
        type: "github",
        owner: "Vexa-ai",
        repo: "vexa",
        ref: "main",
        path: "/",
        autoDeploy: false,
      },
      build: {
        type: "dockerfile",
        file: "Dockerfile.monolithic",
      },
      env: [
        `# ===========================================`,
        `# VEXA API CONFIGURATION`,
        `# ===========================================`,
        ``,
        `# Database connection (auto-configured)`,
        `DATABASE_URL=${databaseUrl}`,
        ``,
        `# Admin API token (auto-generated, use this in dashboard)`,
        `ADMIN_API_TOKEN=${adminApiToken}`,
        ``,
        `# ===========================================`,
        `# WHISPER TRANSCRIPTION SETTINGS`,
        `# ===========================================`,
        `# Default: CPU with tiny model for fast startup`,
        `# For better quality, increase model size (requires more RAM/VRAM)`,
        ``,
        `WHISPER_MODEL_SIZE=tiny`,
        ``,
        `# Available model sizes (quality vs speed tradeoff):`,
        `# - tiny    : Fastest, lowest quality (~1GB RAM)`,
        `# - base    : Fast, decent quality (~1GB RAM)`,
        `# - small   : Balanced (~2GB RAM)`,
        `# - medium  : Good quality (~5GB RAM)`,
        `# - large-v3: Best quality (~10GB RAM/VRAM)`,
        ``,
        `# ===========================================`,
        `# GPU ACCELERATION (Optional)`,
        `# ===========================================`,
        `# Uncomment and configure for GPU support:`,
        ``,
        `# DEVICE=gpu`,
        `# CUDA_VERSION=12.4`,
        ``,
        `# Note: GPU requires NVIDIA GPU with CUDA support`,
        `# and appropriate drivers on the host machine.`,
      ].join("\n"),
      deploy: {
        replicas: 1,
        zeroDowntime: false,
      },
    },
  });

  // Vexa Dashboard (exposed to public)
  services.push({
    type: "app",
    data: {
      serviceName: input.dashboardServiceName,
      source: {
        type: "image",
        image: input.dashboardServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      env: [
        `# ===========================================`,
        `# VEXA DASHBOARD CONFIGURATION`,
        `# ===========================================`,
        ``,
        `# Vexa API connection (auto-configured for internal communication)`,
        `VEXA_API_URL=${vexaApiInternal}`,
        `VEXA_ADMIN_API_URL=${vexaAdminApiInternal}`,
        `VEXA_ADMIN_API_KEY=${adminApiToken}`,
        ``,
        `# Bot name displayed in meetings`,
        `DEFAULT_BOT_NAME=${input.defaultBotName || "Vexa Transcription Bot"}`,
        ``,
        `# ===========================================`,
        `# AI ASSISTANT (Optional)`,
        `# ===========================================`,
        `# Uncomment and configure to enable AI-powered transcript analysis`,
        ``,
        `# AI_MODEL=openai/gpt-4o`,
        `# AI_API_KEY=sk-your-openai-api-key`,
        ``,
        `# Supported AI providers and models:`,
        `# - OpenAI:    openai/gpt-4o, openai/gpt-4o-mini`,
        `# - Anthropic: anthropic/claude-sonnet-4-20250514`,
        `# - Groq:      groq/llama-3.3-70b-versatile (fast & free tier)`,
        `# - Ollama:    ollama/llama3.2 (local, requires AI_BASE_URL)`,
        ``,
        `# For Ollama (local AI), also set:`,
        `# AI_BASE_URL=http://your-ollama-host:11434/v1`,
        ``,
        `# ===========================================`,
        `# EMAIL AUTHENTICATION (Optional)`,
        `# ===========================================`,
        `# Configure SMTP for Magic Link authentication`,
        `# Without SMTP, users login with email only (no verification)`,
        ``,
        `# SMTP_HOST=smtp.resend.com`,
        `# SMTP_PORT=587`,
        `# SMTP_USER=resend`,
        `# SMTP_PASS=your-smtp-password`,
        `# SMTP_FROM=noreply@yourdomain.com`,
        ``,
        `# ===========================================`,
        `# ACCESS CONTROL (Optional)`,
        `# ===========================================`,
        ``,
        `# Allow new user registrations (default: true)`,
        `# ALLOW_REGISTRATIONS=true`,
        ``,
        `# Restrict signups to specific email domains (comma-separated)`,
        `# ALLOWED_EMAIL_DOMAINS=company.com,partner.org`,
      ].join("\n"),
      deploy: {
        replicas: 1,
        zeroDowntime: true,
      },
    },
  });

  return { services };
}
