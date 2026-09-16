<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	import { styles } from '../styles';
	import type { Color, Option, Size } from '../types';

	type Props = Omit<
		HTMLInputAttributes,
		'type' | 'size' | 'color' | 'children' | 'value' | 'checked'
	> & {
		name: string;
		label: string;
		value?: string;
		options: readonly Option[];
		color?: Color;
		size?: Size;
		orientation?: 'horizontal' | 'vertical';
		hint?: string;
	};

	const uid = $props.id();

	let {
		name,
		label,
		value = $bindable(''),
		options,
		color = 'secondary',
		size = 'xs',
		orientation = 'vertical',
		hint,
		disabled,
		id = uid,
		class: className,
		'aria-describedby': describedBy,
		...attrs
	}: Props = $props();

	const description = $derived(
		[describedBy, hint ? `${id}-hint` : undefined].filter(Boolean).join(' ') || undefined,
	);
	const group = {
		get value() {
			return value;
		},
		set value(next: string | null) {
			value = next ?? '';
		},
	};
</script>

<fieldset {disabled} aria-describedby={description}>
	<legend class={styles.field.legend}>{label}</legend>
	<div
		class={[
			'flex',
			orientation === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2',
		]}
	>
		{#each options as option, index (option.value)}
			<label class={styles.field.label}>
				<input
					{...attrs}
					id={`${id}-${index}`}
					type="radio"
					{name}
					value={option.value}
					bind:group={group.value}
					disabled={disabled || option.disabled}
					class={[
						styles.radio.base,
						styles.radio.color[color],
						styles.radio.size[size],
						className,
					]}
				/>
				<span>{option.label}</span>
			</label>
		{/each}
	</div>

	{#if hint}
		<p id={`${id}-hint`} class={styles.field.hint}>{hint}</p>
	{/if}
</fieldset>
