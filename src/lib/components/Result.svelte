<script>
	import { uriMappings } from '$lib/config';

	export let result;
	export let search;
	// console.log(result);

	function highlightText(text, word) {
		if (!word) return text;
		const parts = text.split(new RegExp(`(${word})`, 'gi'));
		return parts
			.map((part) =>
				part.toLowerCase() === word.toLowerCase()
					? `<span class="underline decoration-indigo-500 bg-yellow-300">${part}</span>`
					: part
			)
			.join('');
	}
	$: highlightedText = highlightText(result.value.value, search);
</script>

<div class="card card-border bg-base-100 w-3/4">
	<div class="card-body">
		<div class="flex flex-row items-center justify-between">
			<h2 class="card-title">{uriMappings[result.type.value] ?? result.type.value}</h2>
			<div class="flex gap-2">
				{#if result?.fach?.value}
					<div class="badge badge-warning badge-outline">{result?.fach?.value}</div>
				{/if}
				{#if result?.jahrgangsstufen?.value}
					<div class="badge badge-warning badge-outline">{result?.jahrgangsstufen?.value}</div>
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
