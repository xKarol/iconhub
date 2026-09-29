<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://iconhub.xkarol.workers.dev/lucide/shapes.svg?fill=ffffff">
    <img src="https://iconhub.xkarol.workers.dev/lucide/shapes.svg?fill=000000" alt="IconHub" width="80" height="80">
  </picture>
</p>

<h1 align="center">IconHub</h1>

<p align="center">
  An on-demand icon CDN serving any icon as SVG or raster image at any size, powered by Cloudflare Workers.
</p>

<p align="center">
  <a href="https://hono.dev/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Hono.svg?variant=branded&size=xs&logo=hono&mode=dark"><img alt="Hono" src="https://shieldcn.dev/badge/Hono.svg?variant=branded&size=xs&logo=hono&mode=light"></picture></a>
  <a href="https://www.typescriptlang.org/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/TypeScript.svg?variant=branded&size=xs&logo=typescript&mode=dark"><img alt="TypeScript" src="https://shieldcn.dev/badge/TypeScript.svg?variant=branded&size=xs&logo=typescript&mode=light"></picture></a>
  <a href="https://bun.sh/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Bun.svg?variant=branded&size=xs&logo=bun&mode=dark"><img alt="Bun" src="https://shieldcn.dev/badge/Bun.svg?variant=branded&size=xs&logo=bun&mode=light"></picture></a>
  <a href="https://workers.cloudflare.com/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Cloudflare-Workers.svg?variant=branded&size=xs&logo=cloudflare&mode=dark"><img alt="Cloudflare Workers" src="https://shieldcn.dev/badge/Cloudflare-Workers.svg?variant=branded&size=xs&logo=cloudflare&mode=light"></picture></a>
</p>

<p align="center">
  <a href="https://iconhub.xkarol.workers.dev/"><strong>Try the live API →</strong></a>
</p>

IconHub turns a folder of SVG icons into a URL-addressable API. Request an icon by set and name, pick a file extension, and optionally scale it — the server injects the requested size into the SVG or rasterizes it on the fly to PNG, JPEG, or WebP. Icons ship as Cloudflare static assets, so reads are fast and cheap.

## Features

- Single endpoint that serves any icon as `svg`, `png`, `jpg`, `jpeg`, or `webp`
- On-the-fly sizing via the `size` query parameter (1–128, default 24)
- Icon color customization via the `fill` query parameter
- Background color customization via the `background` query parameter
- Rasterization with WASM (`resvg` for rendering, `photon` for encoding)
- Multiple icon sets backed by auto-generated registries (currently [Lucide](https://lucide.dev/), [Phosphor](https://phosphoricons.com/), [Remix Icon](https://remixicon.com/), and [Tabler](https://tabler.io/icons))
- Strict request validation with Zod and centralized JSON error responses
- CORS enabled, so icons work directly in browser apps
- No database, no secrets, no configuration required to run

## Tech stack

- [Hono](https://hono.dev/) web framework on [Cloudflare Workers](https://workers.cloudflare.com/)
- [TypeScript](https://www.typescriptlang.org/) and [Bun](https://bun.sh/)
- [@cf-wasm/resvg](https://www.npmjs.com/package/@cf-wasm/resvg) and [@cf-wasm/photon](https://www.npmjs.com/package/@cf-wasm/photon) for image conversion
- [Zod](https://zod.dev/) with [`@hono/zod-validator`](https://github.com/honojs/middleware)
- [Biome](https://biomejs.dev/), [Lefthook](https://lefthook.dev/), and GitHub Actions

## API

Fetch any icon with:

```text
GET /{set}/{name}.{ext}?size={n}
```

| Parameter | Description |
| --- | --- |
| `set` | Icon set name, e.g. `lucide`; validated against the generated registry |
| `name` | Icon name plus extension, e.g. `zap.png` |
| `ext` | Output format: `svg`, `png`, `jpg`, `jpeg`, or `webp` |
| `size` | Optional square size in pixels, integer between 1 and 128 (default 24) |
| `fill` | Optional icon color: CSS named color, `rgb()` without alpha, or 3/6-digit HEX with or without `#` |
| `background` | Optional background color with the same accepted formats as `fill` |

Color values can be passed as named colors (`red`), RGB (`rgb(255, 0, 0)`), or HEX (`0000FF`, `%230000FF`). A literal `#` starts the URL fragment, so HEX values containing `#` must use URL encoding (`%23`).

The color is applied to whichever attribute the icon set draws with: `stroke` for stroke-based sets (`lucide`, `tabler`) and `fill` for fill-based sets (`remix`, `phosphor`).

### Examples

```text
https://iconhub.xkarol.workers.dev/lucide/activity.svg
https://iconhub.xkarol.workers.dev/lucide/activity.svg?size=48
https://iconhub.xkarol.workers.dev/lucide/activity.svg?fill=0000FF
https://iconhub.xkarol.workers.dev/lucide/activity.svg?background=F5F5F5
https://iconhub.xkarol.workers.dev/lucide/activity.svg?fill=%23FFFFFF&background=%23000000
https://iconhub.xkarol.workers.dev/lucide/zap.png?size=128
https://iconhub.xkarol.workers.dev/lucide/home.webp
https://iconhub.xkarol.workers.dev/tabler/home.svg?size=48
https://iconhub.xkarol.workers.dev/remix/home.svg?size=48
https://iconhub.xkarol.workers.dev/phosphor/house.svg?size=48
```

Download an icon:

```bash
curl -o zap.png "https://iconhub.xkarol.workers.dev/lucide/zap.png?size=64"
```

Use it directly in markup:

```html
<img src="https://iconhub.xkarol.workers.dev/lucide/settings.svg?size=32" alt="Settings">
```

> [!NOTE]
> JPEG output has no alpha channel, so transparent regions are flattened onto white before encoding.

### Errors

Validation failures and unknown icons return a JSON error body:

```json
{
  "status": 404,
  "message": "Unknown icon: lucide/nope"
}
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh/docs/installation)

No environment variables are needed.

### 1. Install dependencies

```bash
bun install
```

### 2. Start the application

```bash
bun run dev
```

Open [http://localhost:3000/lucide/activity.svg?size=48](http://localhost:3000/lucide/activity.svg?size=48) to fetch your first icon.

To run against the real Workers runtime instead of Bun's native server:

```bash
bun run cf:dev
```

> [!IMPORTANT]
> After adding or renaming icon directories under `icons/`, run `bun run build:sets` so the new sets become available. The `cf:dev` and `deploy` commands regenerate the registry automatically.

## Adding an icon set

1. Create a new directory under `icons/` named after the set, e.g. `icons/tabler/`.
2. Fill it with `.svg` files named after each icon.
3. Regenerate the registry:

```bash
bun run build:sets
```

The generated `src/generated/sets.ts` drives both request validation and the list of supported sets.

## Available commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server natively in Bun |
| `bun run cf:dev` | Build icon sets and preview through Wrangler |
| `bun run deploy` | Build icon sets and deploy to Cloudflare Workers |
| `bun run build:sets` | Regenerate the icon set registry from `icons/` |
| `bun test` | Run the test suite |
| `bun run lint` | Check code style with Biome |
| `bun run lint:fix` | Fix lint issues automatically |
| `bun run format` | Check formatting with Biome |
| `bun run format:fix` | Format files automatically |
| `bun run check` | Run all Biome checks |
| `bun run check:fix` | Fix all Biome findings automatically |
| `bun run typecheck` | Run TypeScript without emitting files |

## Project structure

```text
├── .github/
│   └── workflows/          CI checks and deploy-on-main workflow
├── icons/
│   ├── lucide/             Lucide icon SVGs served as static assets
│   ├── phosphor/           Phosphor icon SVGs served as static assets
│   ├── remix/              Remix icon SVGs served as static assets
│   └── tabler/             Tabler icon SVGs served as static assets
├── scripts/
│   └── generate-sets.ts    Regenerates the icon set registry
├── src/
│   ├── generated/
│   │   └── sets.ts         Auto-generated list of available sets
│   ├── lib/                SVG sizing and raster conversion helpers
│   ├── middlewares/        Validation and centralized error handling
│   ├── routes/
│   │   └── icons.ts        The icon endpoint
│   └── index.ts            Hono application entry point
├── test/                   Bun tests mirroring src/
├── wrangler.jsonc          Cloudflare Workers configuration
└── package.json            Dependencies and project commands
```

## Deployment

Every push to `main` deploys automatically through GitHub Actions using the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. To deploy manually from your machine:

```bash
bun run deploy
```
