<script lang="ts">
	import type { Snippet } from 'svelte';

	import { styles, textColors } from '../styles';
	import type { TextColor } from '../types';

	type Props = { children: Snippet; level: '1' | '2' | '3' | '4' | '5' | '6'; color?: TextColor };

	let { children, level, color = 'inherit' }: Props = $props();

	const classes = $derived([
		styles.header.base,
		styles.header.level[level],
		styles.header.weight[level],
		textColors[color ?? 'inherit'],
	]);
</script>

<svelte:element this={`h${level}`} class={classes}>
	{@render children()}
</svelte:element>
