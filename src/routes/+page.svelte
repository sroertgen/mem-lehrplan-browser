<script>
	import { onMount } from 'svelte';
	import Result from '$lib/components/Result.svelte';
	import Filter from '$lib/components/Filter.svelte';
	import { queryFTS } from '$lib/fts';

	let search = '';
	let results = [];
	let filters = [];

	async function loadFilters() {
		const faecherRaw = await fetch(`/api/getFilters?filter=${'fach'}`);
		const faecherList = await faecherRaw.json();
		const sortedFaecher = faecherList.sort((a, b) =>
			a.fach.value.localeCompare(b.fach.value, 'de', { sensitivity: 'base' })
		);
		const faecher = ['fach', sortedFaecher];

		const jahrgangsstufeRaw = await fetch(`/api/getFilters?filter=${'jahrgangsstufe'}`);
		const jahrgangsstufeList = await jahrgangsstufeRaw.json();
		const sortedJahrgangsstufe = jahrgangsstufeList.sort(
			(a, b) => Number(a.jahrgangsstufe.value) - Number(b.jahrgangsstufe.value)
		);

		const jahrgangsstufe = ['jahrgangsstufe', sortedJahrgangsstufe];
		filters = [faecher, jahrgangsstufe];
	}
	onMount(() => {
		loadFilters();
	});

	async function handleQuery(event) {
		try {
			event.preventDefault();
			const res = await queryFTS(search);
			results = await res.json();
		} catch (error) {
			console.error('Error fetching results:', error);
		}
	}
</script>

<div class="mt-2 flex w-full flex-col items-center justify-center">
	<form onsubmit={handleQuery}>
		<div class="flex flex-col items-center justify-center md:flex md:flex-row">
			<label for="query"
				>Wonach suchst du?
				<input bind:value={search} id="query" type="text" />
			</label>
			<div>
				{#if filters.length}
					{#each filters as filter}
						<Filter {filter} />
					{/each}
				{/if}
			</div>
		</div>
	</form>

	{#if results.length}
		{#each results as result}
			<Result {result} {search} />
		{/each}
	{/if}
</div>
