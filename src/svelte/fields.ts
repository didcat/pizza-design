import { titleCase } from 'title-case';

export type Verification = {
	icon?: string;
	label: string;
	description?: string;
	regex: RegExp | ((value: string) => boolean);
	validationMeans?: 'error' | 'success';
	checkIfEmpty?: boolean;
};

export type ValueLabel = 'none' | 'value' | 'percentage' | 'both';

export const toTitle = (value: string): string => {
	return titleCase(
		value
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
			.trim(),
	);
};

export const isValid = (rule: Verification, value: string, size: number): boolean => {
	if (rule.checkIfEmpty === false && size === 0) {
		return true;
	}

	const matched =
		typeof rule.regex === 'function'
			? rule.regex(value)
			: new RegExp(rule.regex.source, rule.regex.flags.replace('g', '')).test(value);

	return (rule.validationMeans ?? 'success') === 'success' ? matched : !matched;
};

export const formatValue = (
	value: number,
	max: number,
	label: ValueLabel,
	digits: number,
): string | undefined => {
	const percent = ((value / max) * 100).toFixed(digits);

	switch (label) {
		case 'value':
			return `${value}/${max}`;
		case 'percentage':
			return `${percent}%`;
		case 'both':
			return `${value}/${max} (${percent}%)`;
	}
};
