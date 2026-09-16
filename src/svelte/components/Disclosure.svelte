<script lang="ts">
	import type { Snippet } from 'svelte';

	import { styles } from '../styles';

	type Props = { title: string; children: Snippet; open?: boolean };
	let { title, children, open = $bindable(false) }: Props = $props();
</script>

<details bind:open class={styles.disclosure.base}>
	<summary class={[styles.disclosure.summary, styles.focus]}>{title}</summary>

	{@render children()}
</details>
