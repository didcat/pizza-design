<script lang="ts">
	import { styles, textColors } from '../styles';
	import type { TextColor, Size } from '../types';

	type Props = {
		key: string | string[];
		combinationJoin?: string;
		color?: TextColor;
		size?: Size;
	};

	let { key, combinationJoin = '+', color, size }: Props = $props();

	const keyClasses = $derived([
		styles.key.base,
		textColors[color ?? 'inherit'],
		size === undefined ? undefined : styles.key.size[size],
	]);
</script>

{#if typeof key === 'string'}
	<kbd class={keyClasses}>
		{key}
	</kbd>
{:else}
	<div class="gap-1 flex items-center">
		{#each key as k, i}
			<kbd class={keyClasses}>
				{k}
			</kbd>

			{#if i !== key.length - 1}
				<span class={size === undefined ? undefined : styles.key.textSize[size]}>
					{combinationJoin}
				</span>
			{/if}
		{/each}
	</div>
{/if}
