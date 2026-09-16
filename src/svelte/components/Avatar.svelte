<script lang="ts">
	import { styles } from '../styles';
	import type { Size } from '../types';

	type Props = {
		username: string;
		imageURL?: string;
		userProfile?: string;
		size?: Size;
		presence?: 'online' | 'offline' | 'away' | 'busy';
	};

	let { username, imageURL, userProfile, size = 'md', presence }: Props = $props();

	const classes = $derived([styles.avatar.base, styles.avatar.size[size]]);

	const placeholderClasses = $derived([styles.avatar.placeholder, styles.avatar.size[size]]);
	const indicatorClasses = $derived([
		styles.avatar.indicatorSize[size],
		styles.avatar.indicator,
		presence === undefined ? undefined : styles.avatar.presence[presence],
	]);
</script>

<svelte:element
	this={userProfile ? 'a' : 'div'}
	href={userProfile}
	class={classes}
	data-tip={username}
>
	{#if imageURL}
		<img src={imageURL} alt="" class={styles.avatar.image} />
	{:else}
		<div class={placeholderClasses}>
			<span>{username[0]}</span>
		</div>
	{/if}

	{#if presence !== undefined}
		<span class={indicatorClasses} data-tip={presence}></span>
	{/if}
</svelte:element>
