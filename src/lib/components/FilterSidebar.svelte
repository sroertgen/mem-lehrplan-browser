<script>
	import { filters } from '$lib/db';
	import Filter from '$lib/components/Filter.svelte';
</script>

<div id="sidebarElement" class="bg-base-100 max-h-screen overflow-y-auto">
	{#key $filters}
		<Filter options={$filters['subjectsByState']} filterKey="subjects" label="Fächer" />
		<Filter options={$filters['states']} filterKey="states" label="Bundesländer" />
		<Filter options={$filters['classLevels']} filterKey="classLevels" label="Jahrgangsstufen" />
	{/key}
</div>
