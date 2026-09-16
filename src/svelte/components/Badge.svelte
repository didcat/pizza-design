<script lang="ts">
	import 'iconify-icon';

	import type { Snippet } from 'svelte';

	import { styles } from '../styles';
	import type { Color, Size, Variant } from '../types';

	type Props = {
		children: Snippet;
		color?: Color;
		variant?: Exclude<Variant, 'link'>;
		size?: Size;
		icon?: `${string}:${string}`;
	};

	let { children, color = 'neutral', variant = 'solid', size = 'md', icon }: Props = $props();

	const classes = $derived([
		styles.badge.base,
		styles.badge.color[color],
		styles.badge.variant[variant],
		styles.badge.size[size],
	]);
</script>

<span class={classes}>
	{#if icon}
		<iconify-icon {icon}></iconify-icon>
	{/if}

	{@render children()}
</span>
