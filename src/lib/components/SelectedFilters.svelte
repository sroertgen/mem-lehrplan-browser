<script>
	import {
		db,
		filters,
		handleQuery,
		searchTerm,
		selectedFilters,
		resetFilters,
		toggleFilter,
		uri2label
	} from '$lib/db';
	import Filter from '$lib/components/Filter.svelte';

	/** @typedef {import('$lib/types.js').FilterItem} FilterItem */
</script>

<div class="mt-2 flex w-full flex-col items-center justify-center">
	<form onsubmit={() => handleQuery($searchTerm)}>
		<!-- Selected Filter -->
		<div class="flex flex-row flex-wrap gap-1">
			{#each Object.entries($selectedFilters) as [key, val]}
				{#each val as v}
					{console.log(v)}
					<span
						class=" cursor-pointer rounded-lg bg-[#FBD022] p-2"
						onclick={() => toggleFilter(key, v)}>{v?.label?.value || $uri2label[v.uri.value]}</span
					>
				{/each}
			{/each}
		</div>
	</form>
</div>
