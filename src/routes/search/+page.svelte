<script>
	import { db, searchTerm } from '$lib/db';
	import Search from '$lib/components/Search.svelte';
	import Result from '$lib/components/Result.svelte';
</script>

<Search />

{#if $db.results.length}
	{#each $db.results as result}
		<Result {result} search={$searchTerm} />
	{/each}
{/if}
