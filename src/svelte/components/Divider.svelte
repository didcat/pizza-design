<script lang="ts">
	import type { Snippet } from 'svelte';

	import { styles } from '../styles';

	type Props = { children?: Snippet; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' };

	let { children, size = 'md' }: Props = $props();

	const classes = $derived([styles.divider.base, styles.divider.size[size]]);
</script>

<div class={classes}>
	{#if children}
		{@render children()}
	{/if}
</div>
