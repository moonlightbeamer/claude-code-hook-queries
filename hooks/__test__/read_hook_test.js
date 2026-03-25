import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hookPath = path.join(__dirname, "..", "read_hook.js");

function runHook(toolArgs) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [hookPath]);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => resolve({ code, stderr }));
    proc.stdin.write(JSON.stringify(toolArgs));
    proc.stdin.end();
  });
}

test("allows reading a normal file", async () => {
  const { code } = await runHook({ tool_input: { file_path: "/some/file.txt" } });
  assert.equal(code, 0);
});

test("blocks reading .env file via file_path", async () => {
  const { code, stderr } = await runHook({ tool_input: { file_path: "/project/.env" } });
  assert.equal(code, 2);
  assert.match(stderr, /Blocked reading .env file/);
});

test("blocks reading .env file via path", async () => {
  const { code, stderr } = await runHook({ tool_input: { path: "/project/.env" } });
  assert.equal(code, 2);
  assert.match(stderr, /Blocked reading .env file/);
});

test("blocks reading .env.local via file_path", async () => {
  const { code } = await runHook({ tool_input: { file_path: "/project/.env.local" } });
  assert.equal(code, 2);
});

test("allows reading a file with no path fields", async () => {
  const { code } = await runHook({ tool_input: {} });
  assert.equal(code, 0);
});
