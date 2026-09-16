<script lang="ts">
	import 'iconify-icon';

	import { untrack } from 'svelte';

	import { isValid, toTitle, type Verification } from '../fields';
	import { styles } from '../styles';

	import Button from './Button.svelte';

	type Props = {
		type?: 'text' | 'email' | 'password';
		name: string;
		value?: string;
		icon?: string;
		label?: string;
		noLabel?: boolean;
		hint?: string;
		hintLabel?: string;
		placeholder?: string;
		note?: string;
		required?: boolean;
		requiredLabel?: string;
		disabled?: boolean;
		verifications?: Verification[];
		minCharsLabel?: string;
		minChars?: number;
		maxCharsLabel?: string;
		maxChars?: number;
		trimValue?: boolean;
		width?: 'fit' | 'full';
	};

	let {
		type = 'text',
		name,
		value = $bindable(''),
		icon,
		label = '',
		noLabel = false,
		hint,
		hintLabel = 'what is this?',
		placeholder = '',
		note = '',
		required = false,
		requiredLabel = 'required',
		disabled,
		verifications,
		minCharsLabel = 'min',
		minChars,
		maxCharsLabel = 'max',
		maxChars,
		trimValue = true,
		width = 'full',
	}: Props = $props();

	let currentType = $state(untrack(() => type));
	let input = $state<HTMLInputElement>();

	const valueSize = $derived(trimValue ? value.trim().length : value.length);

	const errors = $derived({
		min: minChars !== undefined && valueSize < minChars,
		max: maxChars !== undefined && valueSize > maxChars,
	});

	const rangeHint = $derived(
		[
			minChars !== undefined ? `${minCharsLabel} ${minChars}` : null,
			maxChars !== undefined ? `${maxCharsLabel} ${maxChars}` : null,
		]
			.filter(Boolean)
			.join(', '),
	);

	$effect(() => {
		if (!input) {
			return;
		}

		const skip = valueSize === 0 && !required;
		const failed = skip ? undefined : verifications?.find((v) => !isValid(v, value, valueSize));

		input.setCustomValidity(failed ? (failed.description ?? failed.label) : '');
	});

	const trim = (): void => {
		if (!trimValue) {
			return;
		}

		value = value.trim();
	};

	const togglePassword = (): void => {
		if (type !== 'password') {
			return;
		}

		if (currentType === 'password') {
			currentType = 'text';
		} else if (currentType === 'text') {
			currentType = 'password';
		}
	};

	const clearValue = (): void => {
		value = '';
	};
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

	<div class="flex">
		<label class={styles.input.base}>
			{#if icon}
				<iconify-icon {icon}></iconify-icon>
			{/if}
			<input
				bind:this={input}
				type={currentType}
				{name}
				class="grow"
				{placeholder}
				bind:value
				{required}
				onblur={trim}
				minlength={minChars}
				maxlength={maxChars}
				{disabled}
			/>
		</label>
		{#if valueSize > 0}
			<Button
				color="error"
				variant="soft"
				icon="mdi:clear"
				shape="square"
				onclick={clearValue}
			/>
		{/if}
		{#if type === 'password'}
			<Button
				color="primary"
				icon={currentType === 'password' ? 'mdi:eye-off' : 'mdi:eye'}
				shape="square"
				onclick={togglePassword}
			/>
		{/if}
	</div>

	<div class={styles.field.note}>
		<span>{note}</span>

		<div class="grow"></div>

		<div class="flex items-center">
			{#if verifications}
				{#each verifications as verification}
					<span
						class={[
							styles.field.validation,
							isValid(verification, value, valueSize)
								? styles.badge.color.success
								: styles.badge.color.error,
							verification.description && styles.tooltip,
						]}
						data-tip={verification.description}
					>
						{#if verification.icon}
							<iconify-icon icon={verification.icon}></iconify-icon>
						{/if}
						{verification.label}
					</span>
				{/each}
			{/if}
			{#if minChars || maxChars}
				<span
					class={[
						styles.field.validation,
						styles.field.count,
						errors.min || errors.max
							? styles.badge.color.error
							: styles.badge.color.success,
					]}
					data-tip={rangeHint}
				>
					<iconify-icon icon="mdi:arrow-expand-horizontal"></iconify-icon>
					{valueSize}{#if maxChars}/{maxChars}{/if}
				</span>
			{/if}
		</div>
	</div>
</fieldset>
