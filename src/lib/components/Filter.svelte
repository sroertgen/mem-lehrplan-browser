<script>
	import { uri2label } from '$lib/db';
	import FilterOptions from './FilterOptions.svelte';
	import Map from '$lib/icons/Map.svelte';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import ChevronUp from '$lib/icons/ChevronUp.svelte';
	import Funnel from '$lib/icons/Funnel.svelte';

	export let filterKey;
	export let label;
	export let options;

	let expanded = true;
</script>

<div class="ml-4">
	<div
		onclick={() => (expanded = !expanded)}
		class="my-2 flex cursor-pointer flex-row items-center justify-between overflow-y-auto"
	>
		<!-- FilterIcon -->
		<div class="my-2 flex flex-row items-center gap-2">
			{#if filterKey === 'states'}
				<Map />
			{:else if filterKey === 'subject'}
				<Funnel />
			{:else if label === 'Bayern'}
				<img
					src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Flag_map_of_Bavaria.svg/235px-Flag_map_of_Bavaria.svg.png"
					class="h-5 w-5 object-contain"
				/>
			{:else}
				<Funnel />
			{/if}
			<p>{label}</p>
		</div>
		{#if expanded}
			<ChevronUp />
		{:else}
			<ChevronDown />
		{/if}
	</div>

	<!-- Filter Options -->
	{#if expanded}
		{#if !Array.isArray(options)}
			{#each Object.keys(options) as key}
				<svelte:self options={options[key]} {filterKey} label={$uri2label[key]} />
			{/each}
		{:else}
			<FilterOptions {options} {filterKey} />
		{/if}
		<div class="ml-1 flex flex-col gap-2"></div>
	{/if}
</div>
