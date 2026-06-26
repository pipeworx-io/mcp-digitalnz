interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * DigitalNZ MCP.
 *
 * DigitalNZ — 30M+ digitised New Zealand cultural-heritage items (images, newspapers, audio, archives) aggregated from museums, libraries & galleries. Works keyless; a free key raises rate limits.
 */


const BASE = 'https://api.digitalnz.org';
const UA = 'pipeworx-mcp-digitalnz/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search the DigitalNZ collection by keyword. Returns matching items with ids (pass an id to record), titles, creators/sources, dates and links.',
    inputSchema: { type: 'object', properties: {
      query: { type: 'string', description: 'Keyword(s).' },
      limit: { type: 'number', description: 'Max results (1-100, default 20).' },
      page: { type: 'number', description: 'Page (1-based, default 1).' },
      _apiKey: { type: 'string', description: 'DigitalNZ API key (optional) (auto-injected by the platform).' },
    }, required: ['query'] },
  },
  {
    name: 'record',
    description: 'Fetch full details for one DigitalNZ item by id — a DigitalNZ record id (the "id" field from search).',
    inputSchema: { type: 'object', properties: {
      id: { type: 'string', description: 'e.g. "1234567".' },
      _apiKey: { type: 'string', description: 'DigitalNZ API key (optional).' },
    }, required: ['id'] },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const key = typeof args._apiKey === 'string' ? args._apiKey : '';
  delete args._apiKey;
  // key optional — works keyless, key (if injected) raises rate limits.
  switch (name) {
    case 'search': {
      const limit = clamp(numArg(args.limit, 20), 1, 100);
      const p = new URLSearchParams();
      p.set('text', String(args.query ?? ''));
      p.set('per_page', String(limit));
      const page = Math.max(1, numArg(args.page, 1));
      if (page > 1) p.set('page', String(page));
      
      if (key) p.set('api_key', key);
      return get(`${BASE}/v3/records.json?${p}`, key);
    }
    case 'record': {
      const id = reqStr(args, 'id', '"1234567"');
      const dp = new URLSearchParams(); if(key) dp.set('api_key', key); const dq = dp.toString() ? '?'+dp.toString() : '';
      return get(`${BASE}/v3/records/${encodeURIComponent(id)}.json${dq}`, key);
    }
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

async function get(url: string, key: string): Promise<unknown> {
  const headers = { Accept: 'application/json', 'User-Agent': UA };
  const res = await fetch(url, { headers });
  if (res.status === 401 || res.status === 403) throw new Error('DigitalNZ: key rejected/missing. Get a free key at https://digitalnz.org/developers.');
  if (!res.ok) throw new Error(`DigitalNZ: ${res.status} ${await res.text().then((t) => t.slice(0, 160))}`);
  return res.json();
}
function reqStr(args: Record<string, unknown>, k: string, ex: string): string { const v = args[k]; if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`); return v; }
function numArg(v: unknown, d: number): number { const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN; return Number.isFinite(n) ? n : d; }
function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, Math.trunc(n))); }

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
