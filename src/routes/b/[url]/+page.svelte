<script>
	import { uriMappings } from '$lib/config.js';
	import { isValidURI } from '$lib/utils';
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<div class="mx-auto flex w-2/3 flex-col items-center justify-center gap-2">
	<h1 class="text-xl">Details</h1>

	<table
		class="w-full table-fixed border-separate border-spacing-4 border border-gray-400 dark:border-gray-500"
	>
		<thead> <tr> <th>Attribut</th> <th>Wert</th> </tr> </thead>
		<tbody>
			{#each data.subjectInfo as s}
				{@const value = s.o.value}
				<tr>
					<td class="w-1/4 text-center">{uriMappings[s.p.value] ?? s.p.value}</td>
					<td>
						{#if isValidURI(value)}
							<a class="underline decoration-sky-500" href={`/b/${encodeURIComponent(value)}`}
								>{uriMappings[value] ?? value}</a
							>
						{:else}
							<p>{@html value}</p>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
