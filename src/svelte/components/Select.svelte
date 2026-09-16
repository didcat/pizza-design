<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	import { styles } from '../styles';
	import type { Color, Option, Size } from '../types';

	import Button from './Button.svelte';

	type Props = Omit<
		HTMLSelectAttributes,
		'size' | 'color' | 'children' | 'value' | 'multiple'
	> & {
		name: string;
		label: string;
		value?: string;
		options: readonly Option[];
		placeholder?: string;
		clearable?: boolean;
		clearLabel?: string;
		color?: Color;
		size?: Size;
		width?: 'fit' | 'full';
		hint?: string;
	};

	const uid = $props.id();

	let {
		name,
		label,
		value = $bindable(''),
		options,
		placeholder = '',
		clearable = false,
		clearLabel = 'Clear selection',
		color = 'secondary',
		size = 'md',
		width = 'full',
		hint,
		disabled,
		required,
		id = uid,
		class: className,
		'aria-describedby': describedBy,
		...attrs
	}: Props = $props();

	const description = $derived(
		[describedBy, hint ? `${id}-hint` : undefined].filter(Boolean).join(' ') || undefined,
	);
</script>

<div class={[styles.field.base, width === 'full' ? 'w-full' : 'w-fit']}>
	<label for={id} class={styles.field.legend}>{label}</label>
	<div class="flex">
		<select
			{...attrs}
			{id}
			{name}
			bind:value
			{required}
			{disabled}
			aria-describedby={description}
			class={[
				styles.select.base,
				styles.select.color[color],
				styles.select.size[size],
				className,
			]}
		>
			<option value="" disabled={required}>{placeholder}</option>
			{#each options as option (option.value)}
				<option value={option.value} disabled={option.disabled}>{option.label}</option>
			{/each}
		</select>
		{#if clearable && value !== ''}
			<Button
				color="error"
				variant="soft"
				shape="square"
				{size}
				{disabled}
				aria-label={clearLabel}
				icon="mdi:clear"
				onclick={() => (value = '')}
			/>
		{/if}
	</div>
	{#if hint}
		<p id={`${id}-hint`} class={styles.field.hint}>{hint}</p>
	{/if}
</div>
