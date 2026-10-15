# Requisitos

## Programas

| Programa | Para qué | Cómo comprobarlo |
|---|---|---|
| Node.js 20 o más nuevo | Playwright y los agentes corren sobre Node. | `node --version` |
| Git y una cuenta de GitHub | Hacer fork, clonar y subir la suite. | `git --version` |
| Claude Code o Codex CLI | El agente que escribe la suite. Basta con uno de los dos. | `claude --version` o `codex --version` |
| Visual Studio Code, opcional | Leer y revisar el código. La extensión Playwright Test for VS Code corre las pruebas desde el editor. | |

Los agentes se instalan con npm:

```bash
npm install -g @anthropic-ai/claude-code   # Claude Code
npm install -g @openai/codex               # Codex CLI
```

Claude Code pide una cuenta de Claude, y Codex, una de ChatGPT o una clave de API de OpenAI. Cada uno pide iniciar sesión la primera vez que se abre.

Playwright no se instala aparte. Se agrega al proyecto como parte del ejercicio, junto con sus navegadores.

## MCP de Playwright

El MCP de Playwright es un servidor que le da al agente un navegador. Con él conectado, el agente puede abrir la tienda, leer el árbol de accesibilidad de cada página y hacer clic, así que escribe los page objects a partir de las páginas reales y no a partir de suposiciones.

En Claude Code se conecta con este comando, y `-s user` lo deja disponible en todos los proyectos:

```bash
claude mcp add -s user playwright -- npx @playwright/mcp@latest
claude mcp list
```

En Codex se conecta con este comando:

```bash
codex mcp add playwright -- npx @playwright/mcp@latest
codex mcp list
```

El comando de Codex escribe esta entrada en `~/.codex/config.toml`, y también se puede agregar a mano:

```toml
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

`mcp list` tiene que mostrar el servidor `playwright`. Dentro de Claude Code, el comando `/mcp` muestra si el servidor está conectado.

## MCP de Context7, opcional

Context7 le da al agente la documentación actual de Playwright, y sirve cuando el agente propone funciones viejas o que no existen.

```bash
claude mcp add -s user context7 -- npx -y @upstash/context7-mcp
codex mcp add context7 -- npx -y @upstash/context7-mcp
```
