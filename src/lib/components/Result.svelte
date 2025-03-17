<script>
	import { uriMappings } from '$lib/config';

	export let result;
	export let search;

	function highlightText(text, word) {
		if (!word) return text;
		const parts = text.split(new RegExp(`(${word})`, 'gi'));
		return parts
			.map((part) =>
				part.toLowerCase() === word.toLowerCase()
					? `<span class="underline decoration-indigo-500 text-black bg-yellow-300">${part}</span>`
					: part
			)
			.join('');
	}
	$: highlightedText = highlightText(result.value.value, search);
</script>

<div class="card card-border bg-base-100 w-full md:w-3/4">
	<div class="card-body">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between">
			<h2 class="card-title truncate">
				{result?.type?.value
					.split(',')
					.map((e) => uriMappings[e] || null)
					.filter((e) => e != null)}
			</h2>
			<div class="flex flex-col gap-2 md:flex md:flex-row">
				{#if result?.fach?.value}
					<div class="text-warning border-warning rounded-lg border p-1">
						{result?.fach?.value}
					</div>
				{/if}
				{#if result?.jahrgangsstufen?.value}
					<div class="badge badge-warning badge-outline">
						{result?.jahrgangsstufen?.value
							.split(',')
							.map(Number)
							.sort((a, b) => a - b)}
					</div>
				{/if}
			</div>
		</div>
		<a href={`/b/${encodeURIComponent(result.s.value)}`}>{result.s.value}</a>
		<p>{@html highlightedText}</p>
		<div class="card-actions justify-end">
			<a href={`/b/${encodeURIComponent(result.s.value)}`} class="btn btn-primary">Details</a>
		</div>
	</div>
</div>
