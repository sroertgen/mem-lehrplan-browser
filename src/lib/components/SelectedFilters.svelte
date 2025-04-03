<script>
	import { handleQuery, searchTerm, selectedFilters, toggleFilter, uri2label } from '$lib/db';
	import X from '$lib/icons/X.svelte';

	/** @typedef {import('$lib/types.js').FilterItem} FilterItem */
</script>

<div class="mt-2 flex w-full flex-col items-center justify-center">
	<form onsubmit={() => handleQuery($searchTerm)}>
		<!-- Selected Filter -->
		<div class="flex flex-row flex-wrap gap-1">
			{#each Object.entries($selectedFilters) as [key, val]}
				{#each val as v}
					<span
						class="text-s flex cursor-pointer items-center gap-1 rounded-lg bg-[#FBD022] p-1"
						onclick={() => toggleFilter(key, v)}
						>{v?.label?.value || $uri2label[v.uri.value]} <X /></span
					>
				{/each}
			{/each}
		</div>
	</form>
</div>
