<script>
	import { getChildren, lookupLabel, toggleElement, selectedElements } from '$lib/db';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import ChevronRight from '$lib/icons/ChevronRight.svelte';

	export let id;

	let collapsed = true;
</script>

<div class="flex flex-col gap-2">
	{#await lookupLabel(id) then label}
		{#await getChildren(id) then children}
			<div class="flex">
				{#if children.length > 0}
					<button class="btn btn-circle btn-sm" onclick={() => (collapsed = !collapsed)}>
						{#if children.length > 0 && collapsed}
							<ChevronRight />
						{:else}
							<ChevronDown />
						{/if}
					</button>
				{/if}
				<label class="flex flex-row items-center gap-2">
					<input
						class="checkbox"
						onclick={() => toggleElement(id)}
						type="checkbox"
						checked={$selectedElements.find((e) => e === id)}
					/>
					<a
						href={`/b/${encodeURIComponent(id)}`}
						class="truncate visited:text-sky-500 hover:underline">{label}</a
					>
				</label>
			</div>
			{#if children && children.length > 0 && !collapsed}
				<div class="flex flex-col gap-2">
					{#each children as child}
						<div class="ml-6">
							<svelte:self id={child} />
						</div>
					{/each}
				</div>
			{/if}
		{/await}
	{/await}
</div>
