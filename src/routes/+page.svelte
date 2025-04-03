<script>
	import { onMount } from 'svelte';
	import { db, searchTerm, currentPage, handleQuery, sideBarOpen, totalResults } from '$lib/db';
	import Pagination from '$lib/components/Pagination.svelte';
	import Result from '$lib/components/Result.svelte';
	import FilterSidebar from '$lib/components/FilterSidebar.svelte';
	import SelectedFilters from '$lib/components/SelectedFilters.svelte';

	onMount(() => {
		handleQuery();
	});
</script>

<div class="flex w-full flex-row">
	{#if $sideBarOpen}
		<div class="w-1/4">
			<FilterSidebar />
		</div>
	{/if}
	<div class="mt-2 flex w-full flex-col items-center justify-center">
		<p class="text-lg font-bold">Ergebnisse: {$totalResults}</p>
		<SelectedFilters />
		<div class="flex flex-wrap justify-center gap-2">
			{#if !$db.results.length}
				{#key $db.lps}
					{#each $db.lps as result}
						<Result {result} />
					{/each}
				{/key}
			{:else}
				{#each $db.results.slice($currentPage, $currentPage + 10) as result}
					<Result {result} search={$searchTerm} />
				{/each}
			{/if}
		</div>
		<Pagination />
	</div>
</div>
