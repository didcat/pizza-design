# pizza-design

We had opinions on how to design our web stuff. Very over-the-top opinions, might I add.

## Setup

This package ships Svelte 5 components with Tailwind v4 configuration and a DaisyUI theme. The
consuming app owns Svelte, Tailwind, and DaisyUI:

```sh
pnpm add @didcat/pizza-design
pnpm add -D tailwindcss daisyui
```

Import components from the Svelte-specific entrypoint:

```svelte
<script lang="ts">
	import { Alert, Button } from '@didcat/pizza-design/svelte';
</script>
```

In the app's CSS entrypoint, load the styles in this order:

```css
@import '@didcat/pizza-design/styles/fonts.css';
@import 'tailwindcss';
@import '@didcat/pizza-design/styles/theme.css';
```

All imports stay at the top of the stylesheet. The package theme activates
daisyUI and includes the component source path, so Tailwind can discover classes
used only inside the packaged Svelte components. Do not add a separate
`@plugin 'daisyui'` directive.

Theme colors are also available from the framework-neutral root:

```ts
import { colors } from '@didcat/pizza-design';
```

## Development

Use Node.js 22.18+ and pnpm 11.26.0.

```sh
pnpm install
pnpm format:check
pnpm check
pnpm build
pnpm pack
```

Packing runs type checks and builds both entrypoints. The archive includes only
`dist`, the original `src`, package metadata, and package documentation. The root entrypoint contains
colors and types; Svelte components are exported from `/svelte`. Consumers should
use TypeScript `moduleResolution: "bundler"`, `"node16"`, or `"nodenext"`.

## License

Licensed under MPL 2.0. See [LICENSE](./LICENSE).
