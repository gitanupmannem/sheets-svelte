<script lang="ts">
	import Cell from './Cell.svelte';
	import ColumnHeader from './ColumnHeader.svelte';
	import RowHeader from './RowHeader.svelte';
	import { createSheet, getColumnName, getRowIndex } from './sheet';

	let numOfCols = 26;
	let numOfRows = 50;

	// track active cell
	let activeCell: { column: number; row: number } | null = null;
	// let activeCell: { column: number; row: number } | null = {
	// 	column: 0,
	// 	row: 1
	// };

	const sheet = createSheet({ numOfRows, numOfColumns: numOfCols });
</script>

<!-- style directive, style:<var>=value -->
<main style:--rows={numOfRows} style:--columns={numOfCols}>
	<!-- 
		using javascript to style cells
		"x ch0 ch1 ch2 ch3 ..."
		"rh1 c1-1 c1-2 c1-3 c1-4 ..."
		"rh2 c2-1 c2-2 c2-3 c2-4 ..." 

		style:grid-template-areas={`
		"x ${Array(numOfCols)
			.fill('')
			.map((_, idx) => `ch${idx}`)
			.join(' ')}"
			${Array(numOfRows)
				.fill('')
				.map(
					(_, row) =>
						`"rh${row} ${Array(numOfCols)
							.fill('')
							.map((_, col) => `c${row}-${col}`)
							.join(' ')}"`
				)
				.join(' ')}`}
	-->

	<div>
		<!-- 26*50 row -->
		<!-- { length: 26 } - hack in each block to use number -->
		{#each { length: numOfCols } as _, column}
			<!-- column index prefixed with characters -->
			<!-- String.fromCharCode('A'.charCodeAt(0)) == 'A'
			String.fromCharCode('A'.charCodeAt(0)+1) == 'B' -->
			{@const colName = getColumnName(column)}
			{#each { length: numOfRows } as _, row}
				<!-- row index starts at 1 -->
				{@const rowIndex = getRowIndex(row)}
				{@const cellName = colName + rowIndex}
				<!-- 
					if activeCell is not null and is current column and current row, then true 
					catch data received on custom event 'select', to get current column and current row
				-->
				<Cell
					cell={sheet.get(cellName)}
					{row}
					{column}
					active={activeCell?.column === column && activeCell?.row === row}
					on:select={() => {
						activeCell = { column, row };
					}}
				/>
			{/each}
		{/each}

		{#each { length: numOfCols } as _, column}
			{@const colName = getColumnName(column)}
			<ColumnHeader active={activeCell?.column === column} {column} value={colName} />
		{/each}

		{#each { length: numOfRows } as _, row}
			{@const rowIndex = String(getRowIndex(row))}
			<RowHeader active={activeCell?.row === row} {row} value={rowIndex} />
		{/each}
	</div>
</main>

<style>
	main {
		background-color: peachpuff;
		grid-area: sheet;
		overflow: scroll;
	}

	div {
		display: grid;
		grid-template-rows: repeat(calc(var(--rows) + 1), 20px);
		grid-template-columns: repeat(calc(var(--columns) + 1), minmax(50px, 1fr));
	}
</style>
