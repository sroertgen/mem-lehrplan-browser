<script>
	import { onMount } from 'svelte';
	import Result from '$lib/components/Result.svelte';
	import Filter from '$lib/components/Filter.svelte';
	import { db } from '$lib/db';
	import { queryFTS } from '$lib/fts';

	let search = '';
	let results = [];
	let filters = [];

	async function loadFilters() {
		const faecherRaw = await fetch(`/api/getFilters?filter=${'fach'}`);
		const faecher = ['fach', await faecherRaw.json()];
		const jahrgangsstufeRaw = await fetch(`/api/getFilters?filter=${'jahrgangsstufe'}`);
		const jahrgangsstufe = ['jahrgangsstufe', await jahrgangsstufeRaw.json()];
		filters = [faecher, jahrgangsstufe];
	}
	onMount(() => {
		loadFilters();
	});

	async function handleQuery(event) {
		try {
			event.preventDefault();
			const res = await queryFTS();
			results = await res.json();
		} catch (error) {
			console.error('Error fetching results:', error);
		}
	}
</script>

<div class="mt-2 flex w-full flex-col items-center justify-center">
	<form onsubmit={handleQuery}>
		<label for="query"
			>Wonach suchst du?
			<input bind:value={search} id="query" type="text" />
		</label>
		{#if filters.length}
			{#each filters as filter}
				<Filter {filter} />
			{/each}
		{/if}
	</form>

	{#if results.length}
		{#each results as result}
			<Result {result} {search} />
		{/each}
	{/if}
</div>
