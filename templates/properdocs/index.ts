import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dockerfile = `
FROM python:3.12-slim
RUN pip install --no-cache-dir properdocs==1.6.7 properdocs-theme-mkdocs==1.6.7
WORKDIR /docs
EXPOSE 8000
CMD ["sh", "-c", "[ -f properdocs.yml ] || (printf 'site_name: ${input.siteName || "My Documentation"}\\ntheme:\\n  name: mkdocs\\n' > properdocs.yml && mkdir -p docs && printf '# Welcome\\n\\nWelcome to your documentation. Edit this file at docs/index.md.\\n' > docs/index.md); exec properdocs serve --dev-addr=0.0.0.0:8000"]
`.trim();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "dockerfile",
        dockerfile,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "docs",
          mountPath: "/docs",
        },
      ],
    },
  });

  return { services };
}
