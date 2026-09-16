<script lang="ts">
	import { toTitle } from '../fields';
	import { styles } from '../styles';

	type Props = {
		name: string;
		label?: string;
		noLabel?: boolean;
		hint?: string;
		hintLabel?: string;
		required?: boolean;
		requiredLabel?: string;
		disabled?: boolean;
		accept?: string[];
		width?: 'fit' | 'full';
	};

	let {
		name,
		label = '',
		noLabel = false,
		hint,
		hintLabel = 'what is this?',
		required = false,
		requiredLabel = 'required',
		disabled,
		accept,
		width = 'full',
	}: Props = $props();
</script>

<fieldset class={styles.field.base} class:w-fit={width === 'fit'} class:w-full={width === 'full'}>
	<legend class={[styles.field.legend, 'h-10 w-full']}>
		{#if !noLabel}
			<span class="gap-2 flex items-center justify-center">
				{label || toTitle(name)}

				{#if hint}
					<p class={styles.field.hintLink} data-tip={hint}>{hintLabel}</p>
				{/if}
			</span>
		{/if}

		<div class="grow"></div>

		{#if required}
			<span class={styles.field.required}>{requiredLabel}</span>
		{/if}
	</legend>

	<input
		type="file"
		class={styles.fileInput.base}
		{name}
		{required}
		{disabled}
		accept={accept?.join(',')}
	/>
</fieldset>
