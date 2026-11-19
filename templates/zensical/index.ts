import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const zensicalConfig = `[project]
site_name = "${input.siteName}"
docs_dir = "docs"
`;

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
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "file",
          content: zensicalConfig,
          mountPath: "/docs/zensical.toml",
        },
        {
          type: "file",
          content: `# Welcome\n\nAdd your documentation files to the **/docs/docs/** volume.\n`,
          mountPath: "/docs/docs/index.md",
        },
      ],
    },
  });

  return { services };
}
