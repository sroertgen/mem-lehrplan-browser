<script>
	import { filters } from '$lib/db';
	import Filter from '$lib/components/Filter.svelte';
</script>

<div id="sidebarElement" class="bg-base-100 max-h-screen overflow-y-auto">
	{#key $filters}
		{#each $filters as filter}
			<Filter {filter} />
		{/each}
	{/key}
</div>
