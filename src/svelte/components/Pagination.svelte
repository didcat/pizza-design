<script lang="ts">
	import 'iconify-icon';

	import { styles } from '../styles';

	type PageInfo = { total: number | (() => number); current: number | (() => number) };

	type Pages =
		| (PageInfo & { behavior: 'redirect'; button: { href: string } })
		| (PageInfo & {
				behavior: 'input';
				button: { action?: string; inputName: string; inputValue: string };
		  })
		| (PageInfo & { behavior: 'function'; button: { onclick: (page: number) => void } });

	type ExtraKind = 'backward' | 'forward' | 'start' | 'end';

	type Extra =
		| ExtraKind
		| { kind: ExtraKind; label?: string; icon?: string; labelType?: 'tooltip' | 'label' };

	type Props = {
		pages: Pages;
		start?: number;
		around?: number;
		end?: number;
		extraButtons?: Extra[];
	};

	let { pages, start = 1, around = 1, end = 1, extraButtons = [] }: Props = $props();

	const ellipsis = '...';

	const defaults: Record<ExtraKind, { label: string; icon: `${string}:${string}` }> = {
		start: { label: 'First', icon: 'mdi:page-first' },
		backward: { label: 'Prev', icon: 'mdi:chevron-left' },
		forward: { label: 'Next', icon: 'mdi:chevron-right' },
		end: { label: 'Last', icon: 'mdi:page-last' },
	};

	const total = $derived(typeof pages.total === 'function' ? pages.total() : pages.total);
	const current = $derived(typeof pages.current === 'function' ? pages.current() : pages.current);

	const items = $derived.by((): (number | typeof ellipsis)[] => {
		const set = new Set<number>();

		const add = (from: number, to: number): void => {
			const lo = Math.max(1, from);
			const hi = Math.min(total, to);

			for (let page = lo; page <= hi; page++) {
				set.add(page);
			}
		};

		add(1, start);
		add(current - around, current + around);
		add(total - end + 1, total);

		const sorted = [...set].sort((a, b) => a - b);

		const out: (number | typeof ellipsis)[] = [];

		for (let i = 0; i < sorted.length; i++) {
			if (i > 0) {
				const gap = sorted[i] - sorted[i - 1];

				if (gap === 2) {
					out.push(sorted[i] - 1);
				} else if (gap > 2) {
					out.push(ellipsis);
				}
			}

			out.push(sorted[i]);
		}

		return out;
	});

	const resolve = (
		b: Extra,
	): { kind: ExtraKind; label: string; icon: string; labelType: 'tooltip' | 'label' } => {
		const kind = typeof b === 'string' ? b : b.kind;

		return {
			kind,
			label: typeof b === 'string' ? defaults[kind].label : (b.label ?? defaults[kind].label),
			icon: typeof b === 'string' ? defaults[kind].icon : (b.icon ?? defaults[kind].icon),
			labelType: typeof b === 'string' ? 'label' : (b.labelType ?? 'label'),
		};
	};

	const targetOf = (kind: ExtraKind): number => {
		switch (kind) {
			case 'start':
				return 1;
			case 'end':
				return total;
			case 'backward':
				return current - 1;
			case 'forward':
				return current + 1;
		}
	};

	const enabledFor = (kind: ExtraKind): boolean => {
		return kind === 'start' || kind === 'backward' ? current > 1 : current < total;
	};

	const extras = $derived(extraButtons.map(resolve));
	const leftExtras = $derived(extras.filter((e) => e.kind === 'start' || e.kind === 'backward'));
	const rightExtras = $derived(extras.filter((e) => e.kind === 'forward' || e.kind === 'end'));

	const tmpl = (text: string, page: number): string => {
		return text.replace('{{page}}', String(page));
	};
</script>

{#snippet cell(
	page: number,
	disabled: boolean,
	square: boolean,
	label: string,
	icon?: string,
	tooltip: boolean = false,
)}
	{#snippet body()}
		{#if icon}
			<iconify-icon {icon}></iconify-icon>
		{/if}
		{#if !tooltip}
			{label}
		{/if}
	{/snippet}

	{#if pages.behavior === 'redirect'}
		<a
			href={disabled ? undefined : tmpl(pages.button.href, page)}
			class={[
				styles.btn.base,
				styles.pagination.item,
				square && styles.btn.shape.square,
				disabled && styles.btn.disabled,
				tooltip && styles.tooltip,
			]}
			data-tip={tooltip ? label : undefined}
			aria-disabled={disabled}
			tabindex={disabled ? -1 : undefined}
		>
			{@render body()}
		</a>
	{:else if pages.behavior === 'input'}
		<button
			formaction={pages.button.action}
			type="submit"
			name={tmpl(pages.button.inputName, page)}
			value={tmpl(pages.button.inputValue, page)}
			class={[
				styles.btn.base,
				styles.pagination.item,
				square && styles.btn.shape.square,
				disabled && styles.btn.disabled,
				tooltip && styles.tooltip,
			]}
			data-tip={tooltip ? label : undefined}
			{disabled}
		>
			{@render body()}
		</button>
	{:else}
		<button
			type="button"
			class={[
				styles.btn.base,
				styles.pagination.item,
				square && styles.btn.shape.square,
				disabled && styles.btn.disabled,
				tooltip && styles.tooltip,
			]}
			data-tip={tooltip ? label : undefined}
			{disabled}
			onclick={() => pages.button.onclick(page)}
		>
			{@render body()}
		</button>
	{/if}
{/snippet}

<div class={styles.pagination.base}>
	{#each leftExtras as e}
		{@render cell(
			targetOf(e.kind),
			!enabledFor(e.kind),
			e.labelType === 'tooltip',
			e.label,
			e.icon,
			e.labelType === 'tooltip',
		)}
	{/each}

	{#each items as item}
		{#if typeof item !== 'number'}
			<span
				class={[
					styles.btn.base,
					styles.btn.disabled,
					styles.pagination.item,
					styles.btn.shape.square,
				]}
			>
				&hellip;
			</span>
		{:else if item === current}
			<span
				class={[
					styles.btn.base,
					styles.btn.active,
					styles.pagination.item,
					styles.btn.shape.square,
					styles.btn.color.primary,
				]}
			>
				{item}
			</span>
		{:else}
			{@render cell(item, false, true, String(item), undefined)}
		{/if}
	{/each}

	{#each rightExtras as e}
		{@render cell(
			targetOf(e.kind),
			!enabledFor(e.kind),
			e.labelType === 'tooltip',
			e.label,
			e.icon,
			e.labelType === 'tooltip',
		)}
	{/each}
</div>
