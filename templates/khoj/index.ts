// Generated using "npm run build-templates"

import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const djangoSecretKey = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 42110,
        },
      ],
      env: [
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `POSTGRES_PORT=5432`,
        `KHOJ_DJANGO_SECRET_KEY=${djangoSecretKey}`,
        `KHOJ_DEBUG=False`,
        `KHOJ_ADMIN_EMAIL=${input.adminEmail}`,
        `KHOJ_ADMIN_PASSWORD=${input.adminPassword}`,
        `KHOJ_DOMAIN=$(PRIMARY_DOMAIN)`,
        `KHOJ_TERRARIUM_URL=http://$(PROJECT_NAME)-${input.appServiceName}-sandbox:8080`,
        `KHOJ_SEARXNG_URL=http://$(PROJECT_NAME)-${input.appServiceName}-searxng:8080`,
        `#OPENAI_API_KEY=`,
        `#GEMINI_API_KEY=`,
        `#ANTHROPIC_API_KEY=`,
        `#OPENAI_BASE_URL=`,
        `#JINA_API_KEY=`,
        `#SERPER_DEV_API_KEY=`,
        `#FIRECRAWL_API_KEY=`,
        `#OLOSTEP_API_KEY=`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "khoj_config",
          mountPath: "/root/.khoj/",
        },
        {
          type: "volume",
          name: "khoj_model",
          mountPath: "/root/.cache/torch/sentence_transformers",
        },
        {
          type: "volume",
          name: "khoj_models",
          mountPath: "/root/.cache/huggingface",
        },
      ],
      deploy: {
        command: `python3 src/khoj/main.py --host="0.0.0.0" --port=42110 -vv --anonymous-mode --non-interactive`,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      image: input.databaseImage,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-sandbox`,
      source: {
        type: "image",
        image: "ghcr.io/khoj-ai/terrarium:latest",
      },
      env: [`DEBUG=False`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "terrarium-data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-searxng`,
      source: {
        type: "image",
        image: "searxng/searxng:2025.4.12-391bb1268",
      },
      env: [`INSTANCE_NAME=Khoj SearxNG`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "searxng-data",
          mountPath: "/etc/searxng",
        },
      ],
    },
  });

  return { services };
}
