<script lang="ts">
	import {
		Alert,
		Badge,
		Button,
		Checkbox,
		Code,
		H,
		Key,
		Loading,
		P,
		Radio,
		Select,
	} from '@didcat/pizza-design/svelte';

	import { onMount } from 'svelte';

	const options = [
		{ label: 'First', value: 'first' },
		{ label: 'Second', value: 'second' },
		{ label: 'Unavailable', value: 'third', disabled: true },
	];

	let ready = $state(false);
	onMount(() => {
		ready = true;
	});

	let checked = $state(false);
	let choice = $state('');
	let selected = $state('');
	let disabled = $state(false);
	let clicks = $state(0);
</script>

<div data-ready={ready} class="mx-auto max-w-xl space-y-6 p-8">
	<H level="1" color="primary-content">Selection controls</H>
	<form class="space-y-6">
		<Checkbox
			name="accepted"
			value="yes"
			bind:checked
			{disabled}
			required
			color="primary"
			size="md"
			hint="Choose to continue."
		>
			Accept
		</Checkbox>
		<Radio
			name="choice"
			label="Pick one"
			{options}
			bind:value={choice}
			{disabled}
			required
			color="accent"
			size="sm"
		/>
		<Select
			name="selected"
			label="Project"
			{options}
			bind:value={selected}
			{disabled}
			required
			placeholder="Choose a project"
			clearable
			clearLabel="Clear project"
			hint="One project at a time."
		/>
		<Button type="reset" variant="outline">Reset form</Button>
	</form>
	<output data-testid="values">{JSON.stringify({ checked, choice, selected })}</output>
	<Button
		onclick={() => {
			checked = true;
			choice = 'second';
			selected = 'second';
		}}>Set values</Button
	>
	<Button onclick={() => (disabled = !disabled)}>Toggle disabled</Button>
	<Button
		color="primary"
		variant="soft"
		shape="square"
		aria-label="Count"
		onclick={() => clicks++}>+</Button
	>
	<output data-testid="clicks">{clicks}</output>
	<Button isLoading onclick={() => clicks++}>Loading action</Button>
	<P color="primary">Primary text</P>
	<P color="primary-content">Primary content</P>
	<Code color="accent-content">Content token</Code>
	<Key key="Enter" color="success" />
	<Badge color="info" variant="outline">Badge</Badge>
	<Alert color="success">Saved</Alert>
	<Loading variant="dots" />
</div>
