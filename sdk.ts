// Note: the "@anthropic-ai/claude-code" package has been renamed
// to "@anthropic-ai/claude-agent-sdk"
import { query } from "@anthropic-ai/claude-agent-sdk";

const prompt = "Look for duplicate queries in the ./src/queries directory.";

for await (const message of query({
  prompt,
  options: {
    allowedTools: ["Read", "Grep", "Edit"]
  },
})) {
  console.log(JSON.stringify(message, null, 2));
}
