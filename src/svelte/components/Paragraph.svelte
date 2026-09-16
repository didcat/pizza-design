<script lang="ts">
	import type { Snippet } from 'svelte';

	import { styles, textColors } from '../styles';
	import type { TextColor } from '../types';

	type Props = {
		children: Snippet;
		dim?: 'weakest' | 'weak' | 'strong' | 'strongest';
		color?: TextColor;
	};

	let { children, dim, color = 'base-content' }: Props = $props();

	const classes = $derived([
		dim === undefined ? undefined : styles.paragraph.dim[dim],
		textColors[color ?? 'inherit'],
	]);
</script>

<p class={classes}>
	{@render children()}
</p>
