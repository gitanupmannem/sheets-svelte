<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let row: number;
	export let column: number;
	export let value: string;
	export let active: boolean;
</script>

<!-- 
		class directive, class:<condition> 
		dispatch data to custom event 'select' when clicked 
	-->
<div style:--row={row} style:--column={column} class:active on:click={() => dispatch('select')}>
	{value}
</div>

<style>
	div {
		border: 1px solid lightgray;
		grid-row: calc(var(--row) + 2);
		grid-column: calc(var(--column) + 2);
	}
	.active {
		border-color: blueviolet;
		border-width: 2px;
	}
</style>
