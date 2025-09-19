import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const envs = [
    '# Go to your GitHub repository or organization.',
    '# Navigate to Settings > Actions > Runners.',
    '# Click Add Runner and copy the registration token provided.',
    '',
    `RUNNER_NAME=${input.appServiceName}`,
    `GITHUB_URL=${input.githubRepoUrl}`,
    `RUNNER_TOKEN=${input.githubRepoToken}`,
  ]

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: envs.join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
    },
  });

  return { services };
}
