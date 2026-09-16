<script lang="ts">
	import type { Snippet } from 'svelte';

	import { styles, textColors } from '../styles';
	import type { TextColor } from '../types';

	import Button from './Button.svelte';

	type Props = { children: Snippet; color?: TextColor; copy?: boolean; redirect?: string };

	let { children, color, copy, redirect }: Props = $props();

	let codeEl = $state<HTMLElement>();
	let copied = $state(false);

	const copyValue = async (): Promise<void> => {
		await navigator.clipboard.writeText(codeEl?.textContent ?? '');
		copied = true;
		setTimeout(() => (copied = false), 3000);
	};

	const classes = $derived([styles.code.base, textColors[color ?? 'inherit']]);
	const linkClasses = $derived([styles.link.base, textColors[color ?? 'info']]);
</script>

<span class={classes}>
	{#if redirect}
		<a href={redirect} class={linkClasses}>
			<code bind:this={codeEl}>
				{@render children()}
			</code>
		</a>
	{:else}
		<code bind:this={codeEl}>
			{@render children()}
		</code>
	{/if}

	{#if copy}
		<Button
			size="xs"
			color="primary"
			variant="ghost"
			shape="square"
			icon={copied ? 'mdi:check' : 'mdi:content-copy'}
			onclick={copyValue}
		/>
	{/if}
</span>
