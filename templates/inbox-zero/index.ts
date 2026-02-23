import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const redisToken = randomString(32);
  const randomSecret = randomString(32);

  const getLlmEnvVars = (): string[] => {
    const envVars: string[] = [`DEFAULT_LLM_PROVIDER=${input.llmProvider}`];

    envVars.push(
      input.llmProvider === "openai"
        ? `OPENAI_API_KEY=${input.openaiApiKey || ""}`
        : `# OPENAI_API_KEY=`
    );

    envVars.push(
      input.llmProvider === "anthropic"
        ? `ANTHROPIC_API_KEY=${input.anthropicApiKey || ""}`
        : `# ANTHROPIC_API_KEY=`
    );

    envVars.push(
      input.llmProvider === "google"
        ? `GOOGLE_API_KEY=${input.googleApiKey || ""}`
        : `# GOOGLE_API_KEY=`
    );

    envVars.push(
      input.llmProvider === "groq"
        ? `GROQ_API_KEY=${input.groqApiKey || ""}`
        : `# GROQ_API_KEY=`
    );

    if (input.llmProvider === "bedrock") {
      envVars.push(`BEDROCK_ACCESS_KEY=${input.bedrockAccessKey || ""}`);
      envVars.push(`BEDROCK_SECRET_KEY=${input.bedrockSecretKey || ""}`);
      envVars.push(`BEDROCK_REGION=${input.bedrockRegion || "us-west-2"}`);
    } else {
      envVars.push(`# BEDROCK_ACCESS_KEY=`);
      envVars.push(`# BEDROCK_SECRET_KEY=`);
      envVars.push(`# BEDROCK_REGION=us-west-2`);
    }

    if (input.llmProvider === "ollama") {
      envVars.push(`OLLAMA_BASE_URL=${input.ollamaBaseUrl}`);
      envVars.push(`NEXT_PUBLIC_OLLAMA_MODEL=${input.ollamaModel || "phi3"}`);
    } else {
      envVars.push(`# OLLAMA_BASE_URL=http://ollama:11434`);
      envVars.push(`# NEXT_PUBLIC_OLLAMA_MODEL=phi3`);
    }

    envVars.push(
      input.llmProvider === "openrouter"
        ? `OPENROUTER_API_KEY=${input.openrouterApiKey || ""}`
        : `# OPENROUTER_API_KEY=`
    );

    if (input.economyLlmProvider && input.economyLlmProvider !== "none") {
      envVars.push(`ECONOMY_LLM_PROVIDER=${input.economyLlmProvider}`);
      envVars.push(`ECONOMY_LLM_MODEL=${input.economyLlmModel || ""}`);
    } else {
      envVars.push(`# ECONOMY_LLM_PROVIDER=`);
      envVars.push(`# ECONOMY_LLM_MODEL=`);
    }

    return envVars;
  };

  const common_envs = [
    `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?schema=public`,
    `DIRECT_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?schema=public`,

    `NEXTAUTH_SECRET=${randomSecret}`,
    `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,

    // Gmail
    `GOOGLE_CLIENT_ID=${input.googleClientId || ""}`,
    `GOOGLE_CLIENT_SECRET=${input.googleClientSecret || ""}`,
    `GOOGLE_ENCRYPT_SECRET=${randomString(32)}`,
    `GOOGLE_ENCRYPT_SALT=${randomString(16)}`,

    `GOOGLE_PUBSUB_TOPIC_NAME="projects/abc/topics/xyz"`,
    `GOOGLE_PUBSUB_VERIFICATION_TOKEN=`,

    ...getLlmEnvVars(),

    `INTERNAL_API_KEY=`,
    `API_KEY_SALT=`,

    `UPSTASH_REDIS_URL="http://$(PROJECT_NAME)_${input.appServiceName}-redis-http:80"`,
    `UPSTASH_REDIS_TOKEN=${redisToken}`,
    `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
    `QSTASH_TOKEN=`,
    `QSTASH_CURRENT_SIGNING_KEY=`,
    `QSTASH_NEXT_SIGNING_KEY=`,

    `NEXT_PUBLIC_APP_HOME_PATH=/automation # If you want the product to default to email client, set this to /mail`,
    `LOG_ZOD_ERRORS=true`,
    `CRON_SECRET=`,

    `TINYBIRD_TOKEN=`,
    `TINYBIRD_BASE_URL=https://api.us-east.tinybird.co/`,
    `TINYBIRD_ENCRYPT_SECRET=`,
    `TINYBIRD_ENCRYPT_SALT=`,

    `SENTRY_AUTH_TOKEN=`,
    `SENTRY_ORGANIZATION=`,
    `SENTRY_PROJECT=`,
    `NEXT_PUBLIC_SENTRY_DSN=`,

    `NEXT_PUBLIC_AXIOM_DATASET=`,
    `NEXT_PUBLIC_AXIOM_TOKEN=`,

    `NEXT_PUBLIC_POSTHOG_KEY=`,
    `NEXT_PUBLIC_POSTHOG_HERO_AB=`,
    `NEXT_PUBLIC_POSTHOG_ONBOARDING_SURVEY_ID=`,
    `POSTHOG_API_SECRET=`,
    `POSTHOG_PROJECT_ID=`,

    // Marketing emails
    `RESEND_API_KEY=`,
    `LOOPS_API_SECRET=`,

    // Crisp support chat
    `NEXT_PUBLIC_CRISP_WEBSITE_ID=`,

    // Sanity config for blog
    `NEXT_PUBLIC_SANITY_PROJECT_ID=`,
    `NEXT_PUBLIC_SANITY_DATASET="production"`,

    // Payments
    `LEMON_SQUEEZY_SIGNING_SECRET=`,
    `LEMON_SQUEEZY_API_KEY=`,

    `NEXT_PUBLIC_BASIC_MONTHLY_PAYMENT_LINK=#`,
    `NEXT_PUBLIC_BASIC_ANNUALLY_PAYMENT_LINK=#`,

    `NEXT_PUBLIC_PRO_MONTHLY_PAYMENT_LINK=#`,
    `NEXT_PUBLIC_PRO_ANNUALLY_PAYMENT_LINK=#`,
    `NEXT_PUBLIC_PRO_MONTHLY_VARIANT_ID=123`,
    `NEXT_PUBLIC_PRO_ANNUALLY_VARIANT_ID=123`,

    `NEXT_PUBLIC_BUSINESS_MONTHLY_PAYMENT_LINK=#`,
    `NEXT_PUBLIC_BUSINESS_ANNUALLY_PAYMENT_LINK=#`,
    `NEXT_PUBLIC_BUSINESS_MONTHLY_VARIANT_ID=123`,
    `NEXT_PUBLIC_BUSINESS_ANNUALLY_VARIANT_ID=123`,

    `NEXT_PUBLIC_COPILOT_MONTHLY_PAYMENT_LINK=#`,
    `NEXT_PUBLIC_COPILOT_MONTHLY_VARIANT_ID=123`,

    `NEXT_PUBLIC_LIFETIME_PAYMENT_LINK=#`,
    `NEXT_PUBLIC_LIFETIME_VARIANT_ID=123`,
    `NEXT_PUBLIC_LIFETIME_EXTRA_SEATS_PAYMENT_LINK=#`,
    `NEXT_PUBLIC_LIFETIME_EXTRA_SEATS_VARIANT_ID=123`,
  ];

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-redis-http`,
      source: {
        type: "image",
        image: "hiett/serverless-redis-http:latest",
      },

      env: [
        `SRH_MODE=env`,
        `SRH_TOKEN=${redisToken}`,
        `SRH_CONNECTION_STRING=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      env: [
        ...common_envs,
        `DATABASE_URL=postgresql://postgres:${databasePassword}@${input.appServiceName}-db:5432/$(PROJECT_NAME)?schema=public`,
        `DIRECT_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?schema=public`,
        `UPSTASH_REDIS_URL=http://$(PROJECT_NAME)_${input.appServiceName}-redis-http:80`,
        `UPSTASH_REDIS_TOKEN=${redisToken}`,
      ].join("\n"),
    },
  });

  return { services };
}
