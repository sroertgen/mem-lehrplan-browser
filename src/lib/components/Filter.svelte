<script>
	import { toggleFilter, selectedFilters, currentPage, handleQuery } from '$lib/db';
	import { capitalize } from '$lib/utils';
	export let filter;

	const isSelected = (key, val) => $selectedFilters[key].includes(val);
	const filterKey = filter[0];
</script>

<div class="dropdown">
	<div tabindex="0" role="button" class="btn m-1">{capitalize(filterKey)}</div>
	<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
		{#each filter[1] as opt}
			{@const selected = isSelected(filterKey, opt)}
			<li>
				<a
					class={{ 'bg-orange-500': selected, 'text-black': selected }}
					on:click={() => {
						toggleFilter(filterKey, opt);
						currentPage.set(0);
						handleQuery();
					}}
					>{opt.label.value}
				</a>
			</li>
		{/each}
	</ul>
</div>
