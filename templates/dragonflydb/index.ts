
mport { Output, Services, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {

    const services: Services = [];
    const env: string[] = [];
    const password = input.dragonflyPassword || randomString(32);

    env.push('# See https://www.dragonflydb.io/docs/managing-dragonfly/flags for all flags')
    env.push(`DFLY_requirepass=${password || ''}`);

    services.push({
        type: "app",
        data: {
            serviceName: input.appServiceName,
            source: {
                type: "image",
                image: input.appServiceImage,
            },
            env: env.length > 0 ? env.join("\n") : undefined,
            ports: [
                {
                    published: 6379,
                    target: 6379,
                    protocol: "tcp",
                },
            ],
            mounts: [
                {
                    type: "volume",
                    name: "dragonfly_data",
                    mountPath: "/data",
                },
            ],
            domains: [
                {
                    host: "$(EASYPANEL_DOMAIN)",
                    port: 6379,
                },
            ],
        },
    });

    return { services };
}
