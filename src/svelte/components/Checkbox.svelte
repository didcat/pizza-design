<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	import { styles } from '../styles';
	import type { Color, Size } from '../types';

	type Props = Omit<HTMLInputAttributes, 'type' | 'size' | 'color' | 'children'> & {
		children: Snippet;
		color?: Color;
		size?: Size;
		hint?: string;
	};

	let {
		children,
		checked = $bindable(false),
		indeterminate = $bindable(false),
		color = 'secondary',
		size = 'xs',
		hint,
		class: className,
		'aria-describedby': describedBy,
		...attrs
	}: Props = $props();

	const id = $props.id();
	const description = $derived(
		[describedBy, hint ? `${id}-hint` : undefined].filter(Boolean).join(' ') || undefined,
	);
</script>

<div>
	<label class={styles.field.label}>
		<input
			{...attrs}
			type="checkbox"
			bind:checked
			bind:indeterminate
			aria-describedby={description}
			class={[
				styles.checkbox.base,
				styles.checkbox.color[color],
				styles.checkbox.size[size],
				className,
			]}
		/>
		<span>{@render children()}</span>
	</label>

	{#if hint}
		<p id={`${id}-hint`} class={styles.field.hint}>{hint}</p>
	{/if}
</div>
