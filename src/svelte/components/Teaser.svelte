<script lang="ts">
	import type { Snippet } from 'svelte';

	import { styles } from '../styles';

	import Header from './Header.svelte';
	import Paragraph from './Paragraph.svelte';
	import Status from './Status.svelte';

	type Props = {
		title: string;
		category: string;
		description: string;
		status?: string;
		preview: Snippet;
		level?: 2 | 3 | 4 | 5 | 6;
	};
	let { title, category, description, status, preview, level = 3 }: Props = $props();
</script>

<article class="flex min-w-0 flex-col items-start">
	<div class={[styles.shape.box, 'mb-6 h-44 w-full overflow-hidden max-sm:mb-4 max-sm:h-40']}>
		{@render preview()}
	</div>
	<div class={['mb-2', styles.teaser.meta]}>
		<Paragraph color="muted">{category}</Paragraph>
	</div>
	<div class="mb-3">
		<Header level={`${level}`}>{title}</Header>
	</div>
	<div class="mb-6 max-sm:mb-4">
		<Paragraph color="muted">{description}</Paragraph>
	</div>
	{#if status}
		<div class={['mt-auto', styles.teaser.meta]}>
			<Status color="warning" size="md" pulse={false}>{status}</Status>
		</div>
	{/if}
</article>
