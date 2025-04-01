<script>
	import { uriMappings } from '$lib/config';
	import { uri2label } from '$lib/db';

	/** @typedef {import('./types.js').ResultItem} ResultItem */

	export let result;
	export let search;

	function highlightText(text, word) {
		try {
			if (!word) return text;
			const parts = text.split(new RegExp(`(${word})`, 'gi'));
			return parts
				.map((part) =>
					part.toLowerCase() === word.toLowerCase()
						? `<span class="underline decoration-indigo-500 text-black bg-yellow-300">${part}</span>`
						: part
				)
				.join('');
		} catch (e) {
			console.error(e);
			return text;
		}
	}

	/**
	 * @returns {Promise<ResultItem>}
	 */
	async function getResultInfo() {
		const res = await fetch(`/api/resultInfo?subject=${result.s.value}&lp=${result.lp.value}`);
		const resultInfo = await res.json();
		return resultInfo;
	}

	$: highlightedText = (text) => highlightText(text, search);
</script>

<div class="card card-border bg-base-100 w-full md:w-3/4">
	<div class="card-body">
		{#await getResultInfo() then resultInfo}
			<div class="flex flex-col md:flex-row md:items-center md:justify-between">
				<h2 class="card-title truncate">
					{resultInfo?.type?.map((e) => uriMappings[e.value] || null).filter((e) => e != null)}
				</h2>
				<div class="flex flex-col gap-2 md:flex md:flex-row">
					{#each resultInfo.subject as subject}
						<div class="text-warning border-warning rounded-lg border p-1">
							{$uri2label[subject.value]}
						</div>
					{/each}
					{#each resultInfo.classLevel as level}
						<div class="badge badge-warning badge-outline">
							{$uri2label[level.value].split(' ')[1] ||
								level.value.split('/')[level.value.split('/').length - 1]}
						</div>
					{/each}
				</div>
			</div>
			<a href={`/b/${encodeURIComponent(result.s.value)}`}>{result.s.value}</a>
			<p>{@html highlightedText(resultInfo.label?.[0].value)}</p>
			<div class="card-actions justify-end">
				<a href={`/b/${encodeURIComponent(result.s.value)}`} class="btn btn-primary">Details</a>
			</div>
		{/await}
	</div>
</div>
