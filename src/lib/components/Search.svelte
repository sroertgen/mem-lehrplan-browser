<script>
	import { db, filters, handleQuery, searchTerm, selectedFilters, resetFilters } from '$lib/db';
	import Filter from '$lib/components/Filter.svelte';

	/** @typedef {import('$lib/types.js').FilterItem} FilterItem */
</script>

<div class="mt-2 flex w-full flex-col items-center justify-center">
	<form onsubmit={() => handleQuery($searchTerm)}>
		<div class=" flex flex-row items-center justify-center gap-2">
			<label class="input">
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
			<div class="flex flex-row">
				{#key $db.filters}
					{#each $filters as filter}
						<Filter {filter} />
					{/each}
				{/key}
			</div>
		</div>

		<!-- Selected Filter -->
		<div class="flex flex-row flex-wrap gap-1">
			{#each Object.entries($selectedFilters) as [key, val]}
				{#each val as v}
					<span class="border-warning text-warning rounded-lg border p-1">{v.label.value}</span>
				{/each}
			{/each}
		</div>
	</form>
</div>
