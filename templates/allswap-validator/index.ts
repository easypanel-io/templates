import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [`PORT=3000`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `sh -c "npm install --no-save fastify-multichain-address && node -e \\"const http=require('http'),{validateCryptoAddress}=require('fastify-multichain-address');http.createServer((q,r)=>{if(q.url==='/health'){r.writeHead(200);return r.end('ok');}r.writeHead(200,{'Content-Type':'application/json'});r.end(JSON.stringify({service:'AllSwap MultiChain Validator',docs:'https://allswap.io/docs',sample:validateCryptoAddress('XRP','rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh','104928173')}));}).listen(3000);\\""`,
      },
      domains: [
        {
          host: `$(EASYPANEL_DOMAIN)`,
          port: 3000,
        },
      ],
    },
  });

  return { services };
}
