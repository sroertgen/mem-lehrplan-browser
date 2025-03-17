<script>
	import { toggleFilter, selectedFilters, allLP, currentPage } from '$lib/db';
	import { capitalize } from '$lib/utils';
	export let filter;

	const isSelected = (key, val) => $selectedFilters[key].includes(val);

	function getOptValue(opt) {
		const firstKey = Object.keys(opt)[0];
		const value = opt[firstKey].value;
		return value;
	}

	const filterKey = filter[0];
	$: console.log($selectedFilters);
</script>

<div class="dropdown">
	<div tabindex="0" role="button" class="btn m-1">{capitalize(filterKey)}</div>
	<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
		{#each filter[1] as opt}
			{@const value = getOptValue(opt)}
			{@const selected = isSelected(filterKey, value)}
			<li>
				<a
					class={{ 'bg-orange-500': selected, 'text-black': selected }}
					on:click={() => {
						toggleFilter(filterKey, value);
						currentPage.set(0);
						allLP();
					}}
					>{value}
				</a>
			</li>
		{/each}
	</ul>
</div>
