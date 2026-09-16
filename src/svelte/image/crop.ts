export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';
export type ImageAspect = { label: string; value: number };
export type ImageSize = { width: number; height: number };
export type ImageCrop = { zoom: number; rotation: number; x: number; y: number };

export const clamp = (value: number, min: number, max: number): number => {
	return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
};

export const fitSize = (ratio: number, width: number, height: number): ImageSize => {
	const next = Math.min(width, height * ratio);

	return { width: Math.max(1, Math.floor(next)), height: Math.max(1, Math.floor(next / ratio)) };
};

export const cropTransform = (image: ImageSize, size: ImageSize, crop: ImageCrop) => {
	const angle = (crop.rotation * Math.PI) / 180;
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const spanX = Math.abs(cos) * size.width + Math.abs(sin) * size.height;
	const spanY = Math.abs(sin) * size.width + Math.abs(cos) * size.height;
	const scale = Math.max(spanX / image.width, spanY / image.height) * crop.zoom;
	const maxX = Math.max(0, (image.width - spanX / scale) / 2);
	const maxY = Math.max(0, (image.height - spanY / scale) / 2);

	const panX = Math.abs(cos) * maxX + Math.abs(sin) * maxY;
	const panY = Math.abs(sin) * maxX + Math.abs(cos) * maxY;
	const x = (clamp(crop.x, -100, 100) / 100) * panX;
	const y = (clamp(crop.y, -100, 100) / 100) * panY;

	return {
		angle,
		scale,
		panX,
		panY,
		x: clamp(cos * x + sin * y, -maxX, maxX),
		y: clamp(-sin * x + cos * y, -maxY, maxY),
	};
};

export const outputSize = (
	image: ImageSize,
	size: ImageSize,
	crop: ImageCrop,
	allowUpscale: boolean,
): ImageSize => {
	const { scale } = cropTransform(image, size, crop);

	if (allowUpscale || scale <= 1) {
		return size;
	}

	return {
		width: Math.max(1, Math.floor(size.width / scale)),
		height: Math.max(1, Math.floor(size.height / scale)),
	};
};

export const drawCrop = (
	canvas: HTMLCanvasElement,
	image: HTMLImageElement,
	size: ImageSize,
	crop: ImageCrop,
	format: ImageFormat,
): void => {
	canvas.width = size.width;
	canvas.height = size.height;

	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Canvas is unavailable.');
	}

	const transform = cropTransform(
		{ width: image.naturalWidth, height: image.naturalHeight },
		size,
		crop,
	);

	if (format === 'image/jpeg') {
		context.fillStyle = '#ffffff';
		context.fillRect(0, 0, size.width, size.height);
	}

	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = 'high';
	context.translate(size.width / 2, size.height / 2);
	context.rotate(transform.angle);
	context.scale(transform.scale, transform.scale);
	context.drawImage(
		image,
		-image.naturalWidth / 2 + transform.x,
		-image.naturalHeight / 2 + transform.y,
	);
};

export const decodeImage = async (file: File): Promise<HTMLImageElement> => {
	const url = URL.createObjectURL(file);
	const image = new Image();

	try {
		image.src = url;
		await image.decode();

		return image;
	} finally {
		URL.revokeObjectURL(url);
	}
};

export const encodeImage = async (
	image: HTMLImageElement,
	size: ImageSize,
	crop: ImageCrop,
	format: ImageFormat,
	quality: number,
	name: string,
): Promise<File> => {
	const canvas = document.createElement('canvas');
	drawCrop(canvas, image, size, crop, format);

	try {
		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(result) => (result ? resolve(result) : reject(new Error('Encoding failed.'))),
				format,
				quality,
			);
		});

		if (blob.type !== format) {
			throw new Error('The requested image format is unavailable.');
		}

		const extension = format === 'image/jpeg' ? 'jpg' : format.slice(6);
		const base = name.replace(/\.[^.]+$/, '') || 'image';

		return new File([blob], `${base}.${extension}`, { type: blob.type });
	} finally {
		canvas.width = 0;
		canvas.height = 0;
	}
};
