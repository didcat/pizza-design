<script lang="ts">
	import { styles } from '../styles';
	import type { Size } from '../types';

	type Props = { size?: Size; variant?: 'spinner' | 'dots' };

	let { size = 'md', variant = 'spinner' }: Props = $props();

	const classes = $derived([
		styles.loading.base,
		styles.loading.size[size],
		styles.loading.variant[variant],
	]);
</script>

<span class={classes}></span>
