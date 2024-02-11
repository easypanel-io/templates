import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  let tipoBanco = "Sqlite";
  let stringConexaoBanco = `Data Source=${input.nomeProjeto}`;

  if (input.tipoBancoDados === "PostgreSql") {
    tipoBanco = "PostgreSql";
    const databasePassword = randomPassword();
    services.push({
      type: tipoBanco,
      data: {
        projectName: input.nomeProjeto,
        serviceName: input.nomeServicoBanco,
        password: databasePassword,
      },
    });
    stringConexaoBanco = `postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.nomeServicoBanco}/$(PROJECT_NAME)?sslmode=disable&connect_timeout=10`;
    //else {
    //   tipoBanco = "mysql";
    //   stringConexaoBanco = `${input.tipoBancoDados}:${databasePassword}@tcp($(PROJECT_NAME)_${input.databaseServiceName}:3306)/$(PROJECT_NAME)`;
    // }
  }

  services.push({
    type: "app",
    data: {
      projectName: input.nomeProjeto,
      serviceName: input.nomeServico,
      env: [
        `ApiKey=${input.chaveApi}`,
        `Storage__Type = FileSystem`,
        `Storage__Path=/var/baget/packages`,
        `Database__Type=${tipoBanco}`,
        `Database__ConnectionString=${stringConexaoBanco}`,
        `Search__Type=Database`,
      ].join("\n"),
      source: { type: "image", image: input.nomeImagemDocker },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  return { services };
}
