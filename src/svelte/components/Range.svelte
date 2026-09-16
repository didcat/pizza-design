<script lang="ts">
	import { formatValue, type ValueLabel } from '../fields';
	import { styles } from '../styles';
	import type { Color, Size } from '../types';

	type Props = {
		min?: number;
		value?: number;
		max: number;
		step?: number;
		label?: ValueLabel;
		percentageFixedLength?: number;
		color?: Color;
		size?: Size;
		disabled?: boolean;
	};

	let {
		min = 0,
		value = $bindable(min),
		max = 100,
		step = 1,
		label = 'value',
		percentageFixedLength = 1,
		color = 'secondary',
		size = 'xs',
		disabled,
	}: Props = $props();

	const shownLabel = $derived(formatValue(value, max, label, percentageFixedLength));

	const classes = $derived([
		styles.range.base,
		styles.range.color[color],
		styles.range.size[size],
	]);
</script>

<div class="gap-1 flex w-full flex-col">
	<input type="range" {min} {max} bind:value {step} class={classes} {disabled} />

	{#if label && label !== 'none'}
		<span class={styles.field.value}>
			{shownLabel}
		</span>
	{/if}
</div>
