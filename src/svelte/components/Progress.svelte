<script lang="ts">
	import { formatValue, type ValueLabel } from '../fields';
	import { styles } from '../styles';
	import type { Color } from '../types';

	type Props = {
		value: number;
		max: number;
		label?: ValueLabel;
		percentageFixedLength?: number;
		color?: Color;
	};

	let {
		value = $bindable(0),
		max = 100,
		label = 'both',
		percentageFixedLength = 1,
		color = 'secondary',
	}: Props = $props();

	const shownLabel = $derived(formatValue(value, max, label, percentageFixedLength));

	const classes = $derived([styles.progress.base, styles.progress.color[color]]);
</script>

<div class="-space-y-2 w-full">
	<progress class={classes} {value} {max}></progress>

	{#if label && label !== 'none'}
		<span class={styles.field.value}>
			{shownLabel}
		</span>
	{/if}
</div>
