import crypto from "crypto";
import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {

    const services: Services = [];


    const env: string[] = [];
    let password = input.dragonflyPassword;

    if (!password) {
        // Generate SHA-1 of current time
        const now = new Date().toISOString();
        password = crypto.createHash("sha1").update(now).digest("hex");
    }

    env.push(`DFLY_REQUIREPASS=${password}`);

    const args = input.dragonflyArgs ? input.dragonflyArgs.split(" ") : [];

    const command = [
        "/usr/local/bin/dragonfly",
        ...args
    ].join(' ').trim();

    services.push({
        type: "app",
        data: {
            serviceName: input.appServiceName,
            source: {
                type: "image",
                image: input.appServiceImage,
            },
            deploy: {
                command: args.length > 0 ? command : undefined,
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

    console.log(
        JSON.stringify({ services }, null, 2)
    )

    return { services };
}
