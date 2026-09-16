<script lang="ts">
	import 'iconify-icon';

	import { styles } from '../styles';

	type Props = { items: { icon?: string; label: string; url?: string }[] };

	let { items }: Props = $props();
</script>

<div class={styles.breadcrumbs.base}>
	<ul>
		{#each items as item}
			<li>
				<svelte:element
					this={item.url ? 'a' : 'p'}
					href={item.url}
					class={['flex items-center', item.url && styles.link.base]}
				>
					{#if item.icon}
						<iconify-icon icon={item.icon}></iconify-icon>
					{/if}

					<span class="mt-0.5">
						{item.label}
					</span>
				</svelte:element>
			</li>
		{/each}
	</ul>
</div>
