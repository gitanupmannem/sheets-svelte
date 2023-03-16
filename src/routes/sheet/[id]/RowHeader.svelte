<script lang="ts">
	export let row: number;
	export let value: string;
	export let active: boolean;
</script>

<!-- 
		class directive, class:<condition> 
		dispatch data to custom event 'select' when clicked 
	-->
<div class:active style:--row={row}>
	{value}
</div>

<style>
	div {
		background-color: lightgray;
		grid-row: calc(var(--row) + 2);
		grid-column: 1;
		position: sticky;
		left: 0;
		text-align: center;
	}

	.active {
		background-color: gray;
	}
</style>
