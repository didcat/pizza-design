<script lang="ts">
	import type { Snippet } from 'svelte';

	import { styles } from '../styles';
	import type { Color } from '../types';

	type Props = { children: Snippet; to: string; color?: Color };

	let { children, to, color = 'accent' }: Props = $props();

	const classes = $derived([styles.link.base, styles.link.color[color]]);
</script>

<a href={to} class={classes}>{@render children()}</a>
