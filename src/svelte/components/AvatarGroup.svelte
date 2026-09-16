<script lang="ts">
	import { styles } from '../styles';
	import type { Size } from '../types';

	import Avatar from './Avatar.svelte';

	type Props = {
		users: { username: string; imageURL?: string; userProfile?: string }[];
		limit?: number;
		size?: Size;
	};

	let { users, limit, size = 'md' }: Props = $props();

	const visibleUsers = $derived(limit === undefined ? users : users.slice(0, limit));
	const remainingCount = $derived(limit === undefined ? 0 : Math.max(users.length - limit, 0));

	const remainingClasses = $derived([styles.avatar.remaining, styles.avatar.size[size]]);
</script>

<div class={styles.avatar.group}>
	{#each visibleUsers as user (user.username)}
		<Avatar
			username={user.username}
			imageURL={user.imageURL}
			userProfile={user.userProfile}
			{size}
		/>
	{/each}

	{#if remainingCount > 0}
		<div class={remainingClasses}>
			<span>+{remainingCount}</span>
		</div>
	{/if}
</div>
