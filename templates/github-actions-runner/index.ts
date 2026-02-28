import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        '# Runner name (default: docker-runner-{hostname})',
        `RUNNER_NAME=${input.appServiceName}`,

        '# GitHub repository URL',
        `REPO_URL=${input.githubRepoUrl}`,

        '# Runner registration token (obtained from Settings > Actions > Runners > New runner)',
        `REGISTRATION_TOKEN=${input.githubRepoToken}`,

        '# OPTIONAL Comma-separated runner labels (default: docker,linux)',
        `# RUNNER_LABELS=<label1,label2>`,

        '# OPTIONAL Run in ephemeral mode (default: false)',
        '# https://docs.github.com/pt/actions/reference/runners/self-hosted-runners#ephemeral-runners-for-autoscaling',
        `EPHEMERAL=false`,

        '# OPTIONAL Disable automatic runner software updates (default: false)',
        '# https://docs.github.com/pt/actions/reference/runners/self-hosted-runners#runner-software-updates-on-self-hosted-runners',
        `DISABLE_UPDATE=false`,
      ].join("\n"),
      mounts: [
        { type: "bind", hostPath: "/var/run/docker.sock", mountPath: "/var/run/docker.sock" },
        { type: "volume", name: "runner_work", mountPath: "/runner/_work" },
        { type: "volume", name: "runner_toolcache", mountPath: "/opt/hostedtoolcache" },
      ],
    },
  });

  return { services };
}
