<script>
	import { db, toggleFilter } from '$lib/db';
	import { capitalize } from '$lib/utils';
	export let filter;
</script>

<details class="dropdown">
	<summary class="btn m-1">{capitalize(filter[0])}</summary>
	<div
		class="menu dropdown-content
    bg-base-100 rounded-box z-1 max-h-52 w-52 overflow-auto p-2 shadow-sm"
	>
		<ul>
			{#each filter[1] as opt}
				{@const key = [filter[0]]}
				{@const val = opt[key].value}
				<li onclick={() => toggleFilter(key, val)}>
					<a class:bg-red-500={$db.selectedFilters[key].includes(val)}>{val}</a>
				</li>
			{/each}
		</ul>
	</div>
</details>
