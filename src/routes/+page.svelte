<script>
	import { onMount } from 'svelte';
	import { db, searchTerm, currentPage, handleQuery } from '$lib/db';
	import Search from '$lib/components/Search.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import Result from '$lib/components/Result.svelte';

	onMount(() => {
		handleQuery();
	});
</script>

<div class="mt-2 flex w-full flex-col items-center justify-center">
	<h1 class="text-lg font-bold">Vorhandene Fachlehrpläne</h1>
	<Search />
	<Pagination />
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
</div>
