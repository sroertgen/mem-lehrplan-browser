<script>
	import {
		db,
		filters,
		handleQuery,
		searchTerm,
		selectedFilters,
		resetFilters,
		toggleFilter
	} from '$lib/db';
	import Filter from '$lib/components/Filter.svelte';

	/** @typedef {import('$lib/types.js').FilterItem} FilterItem */
</script>

<div class="mr-20 w-full">
	<form class="w-full" onsubmit={() => handleQuery()}>
		<div class="flex w-full flex-row items-center justify-center gap-2">
			<label class="input mr-20 w-full">
				<input
					class="grow"
					placeholder="Wonach suchst du?"
					bind:value={$searchTerm}
					id="query"
					type="text"
				/>
				<button
					type="button"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						resetFilters();
					}}
					class="cursor-pointer">Reset</button
				>
			</label>
		</div>
	</form>
</div>
