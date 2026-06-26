# mcp-digitalnz

DigitalNZ MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1102+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search the DigitalNZ collection by keyword. Returns matching items with ids (pass an id to record), titles, creators/sources, dates and links. |
| `record` | Fetch full details for one DigitalNZ item by id — a DigitalNZ record id (the "id" field from search). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "digitalnz": {
      "url": "https://gateway.pipeworx.io/digitalnz/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1102+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Digitalnz data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
