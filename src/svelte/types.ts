export type Color =
	'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
export type TextColor =
	| 'base-100'
	| 'base-200'
	| 'base-300'
	| 'base-content'
	| 'primary'
	| 'primary-content'
	| 'secondary'
	| 'secondary-content'
	| 'accent'
	| 'accent-content'
	| 'neutral'
	| 'neutral-content'
	| 'info'
	| 'info-content'
	| 'success'
	| 'success-content'
	| 'warning'
	| 'warning-content'
	| 'error'
	| 'error-content'
	| 'muted'
	| 'border'
	| 'focus'
	| 'primary-soft'
	| 'primary-soft-content'
	| 'accent-soft'
	| 'accent-soft-content'
	| 'success-soft'
	| 'success-soft-content'
	| 'success-detail'
	| 'inherit';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'solid' | 'outline' | 'dash' | 'soft' | 'ghost' | 'link';
export type Option = { value: string; label: string; disabled?: boolean };
