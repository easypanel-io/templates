import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const redisPassword = randomPassword();
  const searxngSecret = randomPassword();
  const searxngLimiterToml = `
  `;
  const searxngSettingsYaml = `use_default_settings: true
server:
  port: 8888
  bind_address: '0.0.0.0'
  # public URL of the instance, to ensure correct inbound links. Is overwritten
  base_url: false # "http://example.com/location"
  # rate limit the number of request on the instance, block some bots.
  limiter: false
  # enable features designed only for public instances.
  public_instance: false

  # If your instance owns a /etc/searxng/settings.yml file, then set the following
  # values there.

  secret_key: '${searxngSecret}'
  image_proxy: false
  # 1.0 and 1.1 are supported
  http_protocol_version: '1.0'
  # POST queries are more secure as they don't show up in history but may cause
  # problems when using Firefox containers
  method: 'POST'
  default_http_headers:
    X-Content-Type-Options: nosniff
    X-Download-Options: noopen
    X-Robots-Tag: noindex, nofollow
    Referrer-Policy: no-referrer

search:
  formats:
    - json 
  `;

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
      serviceName: `${input.appServiceName}-searxng`,
      source: {
        type: "image",
        image: "searxng/searxng:latest",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "searxng-data",
          mountPath: "/data",
        },
        {
          type: "file",
          mountPath: "/etc/searxng/settings.yml",
          content: searxngSettingsYaml,
        },
        {
          type: "file",
          mountPath: "/etc/searxng/limiter.toml",
          content: searxngLimiterToml,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `REDIS_URL=redis://$(PROJECT_NAME)_${input.appServiceName}-redis:6379`,
        `SEARXNG_URL=http://$(PROJECT_NAME)_${input.appServiceName}-searxng:8080`,
        `OPENAI_API_KEY=${input.openaiApiKey}`,
        `ANTHROPIC_API_KEY=${input.anthropicApiKey}`,
        `GOOGLE_GENERATIVE_AI_API_KEY=${input.googleApiKey}`,
        `GROQ_API_KEY=${input.groqApiKey}`,
        `NEXT_PUBLIC_BASE_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      deploy: {
        command: "bun start -H 0.0.0.0",
      },
    },
  });

  return { services };
}
