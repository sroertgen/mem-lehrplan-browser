<script>
	import { selectedElements } from '$lib/db';
	import { getElementInfo } from '$lib/utils';
</script>

<div id="sidebarElementRight" class="bg-base-100 max-h-screen overflow-y-auto">
	<p>Ausgewählte Elemente</p>
	{#each $selectedElements as el}
		{#await getElementInfo(el) then element}
			{console.log(element)}
			<p>{element.label[0].value}</p>
		{/await}
	{/each}
</div>
