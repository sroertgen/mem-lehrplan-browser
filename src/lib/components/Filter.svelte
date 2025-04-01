<script>
	import { toggleFilter, selectedFilters, currentPage, handleQuery } from '$lib/db';
	import { capitalize } from '$lib/utils';
	import Map from '$lib/icons/Map.svelte';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import ChevronUp from '$lib/icons/ChevronUp.svelte';
	import Funnel from '$lib/icons/Funnel.svelte';

	export let filter;

	const isSelected = (key, val) => $selectedFilters[key].find((e) => e.uri.value === val.uri.value);
	const filterKey = filter[0];
	let expanded = true;
</script>

<div class="ml-4">
	<div
		onclick={() => (expanded = !expanded)}
		class="my-2 flex cursor-pointer flex-row items-center justify-between overflow-y-auto"
	>
		<div class="my-2 flex flex-row items-center gap-2">
			{#if filterKey === 'bundesland'}
				<Map />
			{:else if filterKey === 'subject'}
				<Funnel />
			{:else}
				<Funnel />
			{/if}
			<p>{capitalize(filterKey)}</p>
		</div>
		{#if expanded}
			<ChevronUp />
		{:else}
			<ChevronDown />
		{/if}
	</div>

	<!-- Filter Options -->
	{#if expanded}
		<div class="ml-1 flex flex-col gap-2">
			{#each filter[1] as opt}
				{@const selected = isSelected(filterKey, opt)}

				<label class="flex flex-row items-center gap-2">
					<input
						class="checkbox"
						onclick={() => toggleFilter(filterKey, opt)}
						type="checkbox"
						checked={selected}
					/>
					{opt.label.value.replace('(Schulfach)', '')}
				</label>
			{/each}
		</div>
	{/if}
</div>
