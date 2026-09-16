<script lang="ts">
	import { onDestroy, untrack } from 'svelte';

	import {
		clamp,
		cropTransform,
		decodeImage,
		drawCrop,
		encodeImage,
		fitSize,
		outputSize,
		type ImageAspect,
		type ImageFormat,
	} from '../image/crop';
	import { imageUploadLabels, type ImageUploadLabels } from '../image/labels';
	import { styles } from '../styles';

	import Button from './Button.svelte';

	type Props = {
		name: string;
		label?: string;
		hint?: string;
		value?: File | null;
		disabled?: boolean;
		required?: boolean;
		accept?: readonly ImageFormat[];
		maxFileSize?: number;
		maxPixels?: number;
		minWidth?: number;
		minHeight?: number;
		maxWidth?: number;
		maxHeight?: number;
		outputWidth?: number;
		maxOutputSize?: number;
		aspectRatios?: readonly ImageAspect[];
		aspectRatio?: number;
		maxZoom?: number;
		format?: ImageFormat;
		quality?: number;
		allowUpscale?: boolean;
		labels?: Partial<ImageUploadLabels>;
		onchange?: (file: File | null) => void;
		onerror?: (message: string) => void;
	};

	let {
		name,
		label = 'Image',
		hint,
		value = $bindable(null),
		disabled = false,
		required = false,
		accept = ['image/png', 'image/jpeg', 'image/webp'],
		maxFileSize = 10 * 1024 * 1024,
		maxPixels = 40_000_000,
		minWidth = 1,
		minHeight = 1,
		maxWidth = 4096,
		maxHeight = 4096,
		outputWidth = 1024,
		maxOutputSize,
		aspectRatios = [
			{ label: '1:1', value: 1 },
			{ label: '4:3', value: 4 / 3 },
			{ label: '3:4', value: 3 / 4 },
			{ label: '16:9', value: 16 / 9 },
		],
		aspectRatio = 1,
		maxZoom = 4,
		format = 'image/webp',
		quality = 0.9,
		allowUpscale = false,
		labels = {},
		onchange,
		onerror,
	}: Props = $props();

	const id = $props.id();
	let input = $state<HTMLInputElement>();
	let canvas = $state<HTMLCanvasElement>();
	let image = $state.raw<HTMLImageElement | null>(null);
	let source = $state<File | null>(null);
	let loading = $state(false);
	let processing = $state(false);
	let dragging = $state(false);
	let error = $state('');
	let zoom = $state(1);
	let rotation = $state(0);
	let x = $state(0);
	let y = $state(0);
	let ratio = $state(untrack(() => aspectRatio));
	let width = $state(untrack(() => outputWidth));
	let mime = $state(untrack(() => format));
	let compression = $state(untrack(() => quality));
	let lastValue: File | null = null;
	let loadId = 0;
	let exportId = 0;
	let pointer: { id: number; x: number; y: number } | null = null;

	const text = $derived({ ...imageUploadLabels, ...labels });
	const busy = $derived(loading || processing);
	const zoomLimit = $derived(clamp(maxZoom, 1, 20));
	const original = $derived(
		image
			? { width: image.naturalWidth, height: image.naturalHeight }
			: { width: 1, height: 1 },
	);
	const cropRatio = $derived(
		ratio === 0 ? original.width / original.height : clamp(ratio, 0.1, 10),
	);
	const crop = $derived({ zoom: clamp(zoom, 1, zoomLimit), rotation, x, y });
	const preview = $derived(fitSize(cropRatio, 640, 480));
	const size = $derived(
		outputSize(
			original,
			fitSize(
				cropRatio,
				clamp(width, 1, clamp(maxWidth, 1, 8192)),
				clamp(maxHeight, 1, 8192),
			),
			crop,
			allowUpscale,
		),
	);
	const sourceError = $derived(
		!source
			? ''
			: !accept.some((type) => type === source?.type)
				? text.typeError
				: source.size > maxFileSize
					? text.sizeError
					: original.width < minWidth ||
						  original.height < minHeight ||
						  original.width * original.height > maxPixels
						? text.dimensionError
						: '',
	);
	const issue = $derived(error || sourceError);
	const sliders = $derived([
		{ key: 'zoom', label: text.zoom, value: zoom, min: 1, max: zoomLimit, step: 0.01 },
		{ key: 'rotation', label: text.rotation, value: rotation, min: -180, max: 180, step: 1 },
		{ key: 'x', label: text.x, value: x, min: -100, max: 100, step: 1 },
		{ key: 'y', label: text.y, value: y, min: -100, max: 100, step: 1 },
	]);
	const classes = $derived([styles.field.base, styles.imageUpload.base]);
	const dropClasses = $derived([
		styles.imageUpload.drop,
		dragging && !disabled && styles.imageUpload.dragging,
	]);

	const bytes = (amount: number): string => {
		if (amount < 1024) {
			return `${amount} B`;
		}

		return amount < 1024 * 1024
			? `${(amount / 1024).toFixed(1)} KiB`
			: `${(amount / (1024 * 1024)).toFixed(1)} MiB`;
	};

	const publish = (file: File | null): void => {
		lastValue = file;
		value = file;
		onchange?.(file);
	};

	const fail = (message: string): void => {
		error = message;
		onerror?.(message);
	};

	const resetEdits = (): void => {
		zoom = 1;
		rotation = 0;
		x = 0;
		y = 0;
		ratio = aspectRatio;
		width = outputWidth;
		mime = format;
		compression = quality;
		error = '';
	};

	const clear = (): void => {
		loadId++;
		exportId++;
		image = null;
		source = null;
		loading = false;
		processing = false;
		dragging = false;
		pointer = null;
		resetEdits();
		publish(null);
	};

	const selectFile = async (file: File): Promise<void> => {
		if (disabled || input?.matches(':disabled')) {
			return;
		}

		clear();
		const task = ++loadId;

		if (
			!accept.some((type) => type === file.type) ||
			!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
		) {
			fail(text.typeError);
			return;
		}

		if (file.size > maxFileSize) {
			fail(text.sizeError);
			return;
		}

		loading = true;

		try {
			const decoded = await decodeImage(file);

			if (task !== loadId) {
				return;
			}

			if (
				decoded.naturalWidth < minWidth ||
				decoded.naturalHeight < minHeight ||
				decoded.naturalWidth * decoded.naturalHeight > maxPixels
			) {
				fail(text.dimensionError);
				return;
			}

			source = file;
			image = decoded;
		} catch {
			if (task === loadId) {
				fail(text.decodeError);
			}
		} finally {
			if (task === loadId) {
				loading = false;
			}
		}
	};

	const choose = (event: Event): void => {
		const target = event.currentTarget;

		if (target instanceof HTMLInputElement && target.files?.[0]) {
			void selectFile(target.files[0]);
		}
	};

	const drop = (event: DragEvent): void => {
		event.preventDefault();
		dragging = false;

		if (disabled || input?.matches(':disabled')) {
			return;
		}

		const files = event.dataTransfer?.files;

		if (files?.length !== 1) {
			fail(text.multipleError);
			return;
		}

		void selectFile(files[0]);
	};

	const apply = async (): Promise<void> => {
		if (!image || !source || disabled || busy || input?.matches(':disabled')) {
			return;
		}

		if (sourceError) {
			fail(sourceError);
			return;
		}

		const task = ++exportId;
		publish(null);
		processing = true;
		error = '';

		try {
			const file = await encodeImage(
				image,
				size,
				crop,
				mime,
				clamp(compression, 0.01, 1),
				source.name,
			);

			if (task !== exportId || disabled) {
				return;
			}

			if (maxOutputSize !== undefined && file.size > maxOutputSize) {
				fail(text.outputError);
				return;
			}

			publish(file);
		} catch {
			if (task === exportId) {
				fail(text.encodeError);
			}
		} finally {
			if (task === exportId) {
				processing = false;
			}
		}
	};

	const slide = (key: string, event: Event): void => {
		const target = event.currentTarget;

		if (!(target instanceof HTMLInputElement)) {
			return;
		}

		const next = target.valueAsNumber;

		switch (key) {
			case 'zoom':
				zoom = next;
				break;
			case 'rotation':
				rotation = next;
				break;
			case 'x':
				x = next;
				break;
			case 'y':
				y = next;
				break;
		}
	};

	const startDrag = (event: PointerEvent): void => {
		if (!canvas || disabled || busy || event.button !== 0 || input?.matches(':disabled')) {
			return;
		}

		canvas.focus();
		canvas.setPointerCapture(event.pointerId);
		pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
	};

	const moveDrag = (event: PointerEvent): void => {
		if (!canvas || !pointer || pointer.id !== event.pointerId || disabled || busy) {
			return;
		}

		const rect = canvas.getBoundingClientRect();
		const transform = cropTransform(original, preview, crop);
		const dx = ((event.clientX - pointer.x) * preview.width) / rect.width;
		const dy = ((event.clientY - pointer.y) * preview.height) / rect.height;
		x = transform.panX
			? clamp(x + (dx / transform.scale / transform.panX) * 100, -100, 100)
			: 0;
		y = transform.panY
			? clamp(y + (dy / transform.scale / transform.panY) * 100, -100, 100)
			: 0;
		pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
	};

	const keydown = (event: KeyboardEvent): void => {
		if (disabled || busy || input?.matches(':disabled')) {
			return;
		}

		const step = event.shiftKey ? 10 : 1;

		switch (event.key) {
			case 'ArrowLeft':
				x = clamp(x - step, -100, 100);
				break;
			case 'ArrowRight':
				x = clamp(x + step, -100, 100);
				break;
			case 'ArrowUp':
				y = clamp(y - step, -100, 100);
				break;
			case 'ArrowDown':
				y = clamp(y + step, -100, 100);
				break;
			default:
				return;
		}

		event.preventDefault();
	};

	$effect(() => {
		const next = value;

		if (next !== lastValue) {
			lastValue = next;

			if (next) {
				void selectFile(next);
			} else {
				clear();
			}
		}
	});

	$effect(() => {
		const current = source;
		crop;
		size;
		mime;
		compression;
		maxOutputSize;
		sourceError;
		exportId++;

		untrack(() => {
			processing = false;

			if (current) {
				error = '';
				publish(null);
			}
		});
	});

	$effect(() => {
		if (canvas && image) {
			drawCrop(canvas, image, preview, crop, mime);
		}
	});

	$effect(() => {
		if (!input) {
			return;
		}

		const files = new DataTransfer();

		if (value) {
			files.items.add(value);
		}

		input.files = files.files;
		input.setCustomValidity(issue || (busy || (image && !value) ? text.pending : ''));
	});

	$effect(() => {
		const form = input?.form;
		const reset = (event: Event): void => {
			queueMicrotask(() => {
				if (!event.defaultPrevented) {
					clear();
				}
			});
		};

		form?.addEventListener('reset', reset);
		return () => form?.removeEventListener('reset', reset);
	});

	onDestroy(() => {
		loadId++;
		exportId++;
	});
</script>

<fieldset class={classes} {disabled} aria-busy={busy}>
	<legend class={styles.field.legend}>
		{label}

		{#if required}
			<span class={styles.field.required}>{text.required}</span>
		{/if}
	</legend>

	{#if hint}
		<p id={`${id}-hint`} class={styles.field.hint}>{hint}</p>
	{/if}

	<div
		class={dropClasses}
		role="group"
		aria-label={text.choose}
		ondragover={(event) => {
			event.preventDefault();
			dragging = !disabled;
		}}
		ondragleave={() => (dragging = false)}
		ondrop={drop}
	>
		<label for={id} class={styles.field.legend}>{text.choose}</label>
		<input
			bind:this={input}
			{id}
			{name}
			type="file"
			accept={accept.join(',')}
			{required}
			{disabled}
			class={styles.fileInput.base}
			aria-describedby={`${id}-limits${hint ? ` ${id}-hint` : ''}${issue ? ` ${id}-error` : ''}`}
			aria-invalid={issue ? true : undefined}
			onchange={choose}
		/>

		{#if !source && !loading}
			<p class={styles.field.hint}>{text.empty}</p>
		{/if}

		<p id={`${id}-limits`} class={styles.imageUpload.meta}>
			{text.limits}: {bytes(maxFileSize)} · {maxPixels.toLocaleString()} px

			{#if maxOutputSize !== undefined}
				· {text.outputLimit}: {bytes(maxOutputSize)}
			{/if}
		</p>
	</div>

	{#if loading}
		<p role="status" class={styles.field.hint}>{text.loading}</p>
	{/if}

	{#if image && source}
		<div class={styles.imageUpload.editor}>
			<div class="min-w-0 space-y-2">
				<canvas
					bind:this={canvas}
					class={[styles.imageUpload.canvas, styles.focus]}
					tabindex={disabled ? -1 : 0}
					aria-label={text.crop}
					aria-describedby={`${id}-instructions`}
					aria-disabled={disabled || busy}
					onpointerdown={startDrag}
					onpointermove={moveDrag}
					onpointerup={() => (pointer = null)}
					onpointercancel={() => (pointer = null)}
					onlostpointercapture={() => (pointer = null)}
					onkeydown={keydown}
				>
					{text.crop}
				</canvas>

				<p id={`${id}-instructions`} class={styles.field.hint}>{text.instructions}</p>
				<p class={styles.imageUpload.meta}>
					{text.source}: {original.width} × {original.height} · {bytes(source.size)}
				</p>
			</div>

			<fieldset disabled={disabled || busy} class={styles.imageUpload.controls}>
				<label for={`${id}-aspect`} class={styles.field.legend}>{text.aspect}</label>
				<select id={`${id}-aspect`} bind:value={ratio} class={styles.select.base}>
					<option value={0}>{text.original}</option>
					{#each aspectRatios.filter((aspect) => Number.isFinite(aspect.value) && aspect.value > 0) as aspect}
						<option value={aspect.value}>{aspect.label}</option>
					{/each}
					{#if ratio !== 0 && !aspectRatios.some((aspect) => aspect.value === ratio)}
						<option value={ratio}>{ratio}:1</option>
					{/if}
				</select>

				{#each sliders as slider}
					<label for={`${id}-${slider.key}`} class={styles.field.legend}>
						{slider.label}
						<output>{slider.value.toFixed(slider.step < 1 ? 2 : 0)}</output>
					</label>
					<input
						id={`${id}-${slider.key}`}
						type="range"
						min={slider.min}
						max={slider.max}
						step={slider.step}
						value={slider.value}
						oninput={(event) => slide(slider.key, event)}
						class={[
							styles.range.base,
							styles.range.color.primary,
							styles.range.size.sm,
						]}
					/>
				{/each}

				<div class="flex flex-wrap gap-2">
					<Button
						size="sm"
						color="primary"
						variant="outline"
						onclick={() => (rotation = ((rotation + 450) % 360) - 180)}
					>
						{text.left}
					</Button>
					<Button
						size="sm"
						color="primary"
						variant="outline"
						onclick={() => (rotation = ((rotation + 270) % 360) - 180)}
					>
						{text.right}
					</Button>
				</div>

				<label for={`${id}-width`} class={styles.field.legend}>{text.width}</label>
				<input
					id={`${id}-width`}
					type="number"
					min={1}
					max={clamp(maxWidth, 1, 8192)}
					bind:value={width}
					class={styles.input.base}
				/>

				<label for={`${id}-format`} class={styles.field.legend}>{text.format}</label>
				<select id={`${id}-format`} bind:value={mime} class={styles.select.base}>
					<option value="image/png">PNG</option>
					<option value="image/jpeg">JPEG</option>
					<option value="image/webp">WebP</option>
				</select>

				{#if mime !== 'image/png'}
					<label for={`${id}-quality`} class={styles.field.legend}>
						{text.quality}
						<output>{Math.round(compression * 100)}%</output>
					</label>
					<input
						id={`${id}-quality`}
						type="range"
						min={0.01}
						max={1}
						step={0.01}
						bind:value={compression}
						class={[
							styles.range.base,
							styles.range.color.primary,
							styles.range.size.sm,
						]}
					/>
				{/if}
			</fieldset>
		</div>

		<p role="status" class={styles.imageUpload.meta}>
			{text.output}: {size.width} × {size.height}
			{#if value}
				· {bytes(value.size)}
			{/if}
		</p>
	{/if}

	{#if error}
		<p id={`${id}-error`} role="alert" class={styles.imageUpload.error}>
			{error}
		</p>
	{/if}

	<div class="flex flex-wrap gap-2">
		<Button
			color="primary"
			isLoading={processing}
			disabled={disabled || loading || !image}
			onclick={apply}
		>
			{processing ? text.processing : text.apply}
		</Button>
		<Button
			color="primary"
			variant="outline"
			disabled={disabled || busy || !image}
			onclick={resetEdits}
		>
			{text.reset}
		</Button>
		<Button
			color="error"
			variant="ghost"
			disabled={disabled || (!image && !loading && !error)}
			onclick={clear}
		>
			{text.clear}
		</Button>
	</div>
</fieldset>
