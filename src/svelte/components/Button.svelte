<script lang="ts">
	import 'iconify-icon';

	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import { styles } from '../styles';
	import type { Color, Size, Variant } from '../types';

	type Props = Omit<HTMLButtonAttributes, 'color'> & {
		children?: Snippet;
		color?: Color;
		variant?: Variant;
		size?: Size;
		shape?: 'square' | 'circle';
		wide?: boolean;
		icon?: `${string}:${string}`;
		type?: 'button' | 'submit' | 'reset';
		isLoading?: boolean;
		disabled?: boolean | null;
	};

	let {
		children,
		color = 'neutral',
		variant = 'solid',
		size = 'md',
		shape,
		wide = false,
		icon,
		type = 'button',
		isLoading = false,
		onclick,
		disabled,
		class: className,
		...attrs
	}: Props = $props();

	const classes = $derived([
		styles.btn.base,
		styles.btn.color[color],
		styles.btn.variant[variant],
		styles.btn.size[size],
		shape === undefined ? undefined : styles.btn.shape[shape],
		wide && styles.btn.wide,
		className,
	]);
</script>

<button
	{...attrs}
	aria-busy={isLoading || undefined}
	type={isLoading ? 'button' : type}
	{onclick}
	class={classes}
	disabled={disabled || isLoading}
>
	{#if icon && !isLoading}
		<iconify-icon {icon}></iconify-icon>
	{/if}

	{#if isLoading}
		<span class={[styles.loading.base, styles.loading.size.xs, styles.loading.variant.spinner]}>
		</span>
	{/if}

	{#if children}
		{@render children()}
	{/if}
</button>
