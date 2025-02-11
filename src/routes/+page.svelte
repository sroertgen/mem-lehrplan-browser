<script>
	import { db, handleQuery } from '$lib/db';
	import Result from '$lib/components/Result.svelte';
	import Filter from '$lib/components/Filter.svelte';

	let searchTerm = '';
</script>

<div class="mt-2 flex w-full flex-col items-center justify-center">
	<form onsubmit={() => handleQuery(searchTerm)}>
		<div class="flex flex-col items-center justify-center md:flex md:flex-row">
			<label for="query"
				>Wonach suchst du?
				<input bind:value={searchTerm} id="query" type="text" />
			</label>
			<div>
				{#key $db.filters}
					{#each $db.filters as filter}
						<Filter {filter} />
					{/each}
				{/key}
			</div>
		</div>
	</form>

	{#if $db.results.length}
		{#each $db.results as result}
			<Result {result} search={searchTerm} />
		{/each}
	{/if}
</div>
