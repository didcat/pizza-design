<script lang="ts">
	import 'iconify-icon';

	import type { Snippet } from 'svelte';

	import { styles } from '../styles';

	type Props = {
		children: Snippet;
		color?: 'info' | 'success' | 'warning' | 'error';
		wide?: boolean;
	};

	let { children, color = 'info', wide = false }: Props = $props();

	const classes = $derived([styles.alert.base, styles.alert.color[color], wide && 'w-full']);

	const icons: Record<NonNullable<Props['color']>, string> = {
		info: 'mdi:info',
		success: 'mdi:check',
		warning: 'mdi:alert',
		error: 'mdi:exclamation',
	};
</script>

<div role="alert" class={classes}>
	<div class="gap-2 flex items-center">
		<iconify-icon icon={icons[color]}></iconify-icon>
	</div>

	{@render children()}
</div>
