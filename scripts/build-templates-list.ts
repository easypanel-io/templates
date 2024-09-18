import { writeFile } from "fs/promises";
import * as path from "path";
import templates from "../templates";

const templatesPath = path.resolve(__dirname, "../templates");

async function run() {
  const list = [];

  for (let { slug, meta } of templates) {
    list.push({
      slug,
      logo: meta.logo,
      name: meta.name,
      description: meta.description,
      tags: "tags" in meta ? meta.tags : [],
    });
  }

  await writeFile(
    path.resolve(templatesPath, "list.json"),
    JSON.stringify(list, null, 2)
  );
}

run().catch(console.error);
