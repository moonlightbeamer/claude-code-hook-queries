import fs from "fs";
import path from "path";

const LOG_FILE = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "read_hook.log"
);

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString();
  log(`Hook invoked. Raw input: ${raw}`);

  const toolArgs = JSON.parse(raw);

  // readPath is the path to the file that Claude is trying to read
  const readPath =
    toolArgs.tool_input?.file_path || toolArgs.tool_input?.path || "";

  log(`Resolved readPath: "${readPath}"`);

  // TODO: ensure Claude isn't trying to read the .env file
  if (readPath.includes(".env")) {
    log(`BLOCKED: attempted to read .env file`);
    console.error("Blocked reading .env file");
    process.exit(2);
  }

  log(`ALLOWED: ${readPath}`);
}

main();
