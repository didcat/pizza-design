<script lang="ts">
	import type { Snippet } from 'svelte';

	import { styles } from '../styles';
	import type { Color, Size } from '../types';

	type Props = {
		children?: Snippet;
		color?: Color;
		size?: Size;
		pulse?: boolean;
		round?: boolean;
	};

	let {
		children,
		color = 'secondary',
		size = 'md',
		pulse = true,
		round = false,
	}: Props = $props();

	const classes = $derived([
		styles.status.base,
		styles.status.color[color],
		styles.status.size[size],
		round && styles.shape.round,
	]);
	const pingClasses = $derived([
		styles.status.base,
		styles.status.color[color],
		styles.status.size[size],
		round && styles.shape.round,
		styles.status.pulse,
	]);
</script>

<div class="gap-2 flex items-center">
	<div class="inline-grid *:[grid-area:1/1]">
		{#if pulse}
			<div class={pingClasses}></div>
		{/if}
		<div class={classes}></div>
	</div>

	<span class="mt-0.5">
		{#if children}
			{@render children()}
		{/if}
	</span>
</div>
