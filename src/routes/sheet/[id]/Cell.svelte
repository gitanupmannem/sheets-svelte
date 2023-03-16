<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SheetCell } from './sheet';

	const dispatch = createEventDispatcher();

	export let row: number;
	export let column: number;
	export let active: boolean;
	export let cell: SheetCell;

	enum Mode {
		Editing,
		DisplayValue,
		DisplayFormula
	}

	let mode = Mode.DisplayValue;
	let editValue = cell.formula;
	let displayValue = cell.displayValue;

	function finishEditing(save: boolean) {
		mode = Mode.DisplayValue;
		editValue.stopEditing(save);
	}
</script>

<!-- 
		class directive, class:<condition> 
		dispatch data to custom event 'select' when clicked 
	-->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	style:--row={row}
	style:--column={column}
	class:active
	on:click={() => dispatch('select')}
	on:dblclick={() => {
		if (mode === Mode.DisplayValue) {
			mode = Mode.Editing;
			editValue.startEditing();
		} else {
			mode = Mode.DisplayValue;
		}
	}}
>
	{#if mode === Mode.DisplayValue}
		{$displayValue}
	{:else if mode === Mode.Editing}
		<!-- on click, cell is in editable, when moved away (on:blur) cell is for display value -->
		<!-- using value from store with $store_value-->
		<!-- svelte-ignore a11y-autofocus -->
		<input
			autofocus
			bind:value={$editValue}
			on:blur={() => finishEditing(true)}
			on:keydown={(event) => {
				switch (event.key) {
					case 'Enter':
						finishEditing(true);
						break;
					case 'Escape':
						finishEditing(false);
						break;
				}
			}}
		/>
	{/if}
	<!-- 
		{value} - A-1, A-2,..Z-50
	-->
</div>

<style>
	div {
		outline: 1px solid lightgray;
		grid-row: calc(var(--row) + 2);
		grid-column: calc(var(--column) + 2);
	}
	.active {
		outline-color: blueviolet;
		outline-width: 2px;
	}
	input {
		width: 100%;
		height: 100%;
		margin: 0;
		border: 0;
		box-sizing: border-box;
	}
</style>
