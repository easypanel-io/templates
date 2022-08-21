import { readFile, writeFile } from "fs/promises";
import glob from "glob";
import * as path from "path";
import YAML from "yaml";

const templatesPath = path.resolve(__dirname, "../templates");

async function run() {
  const items = glob
    .sync("./templates/*/index.ts")
    .map((item) => item.slice(12, -9));

  for (const item of items) {
    const meta = YAML.parse(
      await readFile(`./templates/${item}/meta.yaml`, "utf-8")
    );

    delete meta.assets;

    await writeFile(`./templates/${item}/meta.yaml`, YAML.stringify(meta));
  }
}

run().catch(console.error);
