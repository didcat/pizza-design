<script lang="ts">
	import Highlight, { CopyButton, LineNumbers } from 'svelte-highlight';
	import bash from 'svelte-highlight/languages/bash';
	import c from 'svelte-highlight/languages/c';
	import cpp from 'svelte-highlight/languages/cpp';
	import csharp from 'svelte-highlight/languages/csharp';
	import css from 'svelte-highlight/languages/css';
	import go from 'svelte-highlight/languages/go';
	import java from 'svelte-highlight/languages/java';
	import javascript from 'svelte-highlight/languages/javascript';
	import json from 'svelte-highlight/languages/json';
	import markdown from 'svelte-highlight/languages/markdown';
	import php from 'svelte-highlight/languages/php';
	import python from 'svelte-highlight/languages/python';
	import ruby from 'svelte-highlight/languages/ruby';
	import rust from 'svelte-highlight/languages/rust';
	import shell from 'svelte-highlight/languages/shell';
	import sql from 'svelte-highlight/languages/sql';
	import typescript from 'svelte-highlight/languages/typescript';
	import xml from 'svelte-highlight/languages/xml';
	import yaml from 'svelte-highlight/languages/yaml';

	import meowy from '../languages/meowy';
	import { styles } from '../styles';

	const langs = {
		bash,
		shell,
		javascript,
		typescript,
		python,
		json,
		xml,
		css,
		yaml,
		markdown,
		sql,
		go,
		rust,
		java,
		c,
		cpp,
		csharp,
		php,
		ruby,
		meowy,
	};

	type Props = {
		lines: string[];
		language: keyof typeof langs;
		filename?: string;
		numbers?: boolean;
	};

	let { lines, language, filename, numbers }: Props = $props();

	const code = $derived(lines.join('\n'));
	const grammar = $derived(langs[language]);
</script>

<div class={styles.codeblock.base}>
	{#if filename}
		<div class={styles.codeblock.filename}>
			{filename}
		</div>
	{/if}

	<div class="relative px-11 py-4" class:p-2!={numbers}>
		{#if numbers}
			<Highlight language={grammar} {code} let:highlighted>
				<LineNumbers {highlighted} hideBorder class={styles.codeblock.lines} />
			</Highlight>
		{:else}
			<Highlight language={grammar} {code} />
		{/if}

		<CopyButton {code} class={[styles.codeblock.copy, styles.focus].join(' ')} />
	</div>
</div>
