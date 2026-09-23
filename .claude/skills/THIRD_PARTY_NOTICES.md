# Third-Party Notices — vendored skills

The skill folders below are copied into this repo from their upstream sources so
Claude Code can auto-load them for this project. Each retains its own license;
none are modified beyond dropping non-essential upstream files (READMEs, CLI
tooling, zip bundles) that aren't needed at skill-runtime.

| Skill folder(s) | Source | License |
|---|---|---|
| `interface-design` | [Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design) | MIT |
| `react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | MIT |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | MIT |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | Apache-2.0 (see `frontend-design/LICENSE.txt`) |
| `webapp-testing` | [anthropics/skills](https://github.com/anthropics/skills) | Apache-2.0 (see `webapp-testing/LICENSE.txt`) |
| `accessibility-audit`, `accessibility-diff`, `accessibility-fix`, `accessibility-inspect`, `accessibility-scan`, `shared` | [AccessLint/skills](https://github.com/AccessLint/skills) | MIT |

`accessibility-fix` (and rule-metadata lookups in `accessibility-audit`/`accessibility-inspect`) use the
bundled `@accesslint/mcp` server, configured in this repo's root `.mcp.json`. `accessibility-scan` and
`accessibility-diff` work without it — they shell out to `@accesslint/cli` directly.
