import { writeFile } from "fs/promises";
import glob from "glob";

async function run() {
  const items = glob
    .sync("./templates/*/index.ts")
    .map((item) => item.slice(12, -9));

  const output: string[] = [`// Generated using "yarn generate-index"`, ""];

  items.forEach((item, index) => {
    output.push(`import template_${index} from "./${item}";`);
  });

  output.push("", "const templates = [");

  items.forEach((item, index) => {
    output.push(`  { slug: "${item}", template: template_${index} },`);
  });

  output.push("];", "", "export default templates;", "");

  await writeFile("./templates/index.ts", output.join("\n"));
}

run().catch(console.error);
