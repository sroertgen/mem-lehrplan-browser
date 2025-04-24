<script>
	import { selectedElements, selectedElementsAsTree } from '$lib/db';
	import { getElementInfo } from '$lib/utils';
	import Tree from '$lib/components/Tree.svelte';
</script>

<div id="sidebarElementRight" class="bg-base-100 overflow-y-auto">
	<p>Ausgewählte Elemente</p>
	{#each $selectedElements as el}
		{#await getElementInfo(el) then element}
			{console.log(element)}
			<p>{element.label[0].value}</p>
		{/await}
	{/each}

	{#if $selectedElements.length}
		{#each $selectedElements as tree}
			<Tree id={tree} />
		{/each}
	{/if}
</div>
