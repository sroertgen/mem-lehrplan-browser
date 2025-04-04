<script>
	import { isValidURI } from '$lib/utils';
	import { lookupLabel } from '$lib/db';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<div class="mx-auto flex w-2/3 flex-col items-center justify-center gap-2">
	<div class="mx-auto mt-1 select-all">
		<p>{data.url}</p>
	</div>
	<table
		class="w-full table-fixed border-separate border-spacing-4 border border-gray-400 dark:border-gray-500"
	>
		<thead> <tr> <th>Attribut</th> <th>Wert</th> </tr> </thead>
		<tbody>
			{#each data.subjectInfo as s}
				{@const value = s.o.value}
				<tr>
					<td class="w-1/4 text-center">
						{#await lookupLabel(s.p.value) then name}
							{name}
						{/await}
					</td>
					<td>
						{#if isValidURI(value)}
							<a class="underline decoration-sky-500" href={`/b/${encodeURIComponent(value)}`}>
								{#await lookupLabel(value) then name}
									{name}
								{/await}
							</a>
						{:else}
							<p>{@html value}</p>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
