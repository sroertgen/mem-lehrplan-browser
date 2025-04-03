<script>
	import { toggleFilter, selectedFilters } from '$lib/db';

	export let options;
	export let filterKey;

	const isSelected = (key, val) => $selectedFilters[key].find((e) => e.uri.value === val.uri.value);
</script>

<div class="flex flex-col gap-1">
	{#each options as opt}
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
